const ADMIN_API_VERSION = "2024-10";

interface DraftOrderLineItem {
  variantId: string;
  quantity: number;
}

interface DraftOrderCustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface DraftOrderAddress {
  address1?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

interface CreateDraftOrderInput {
  lineItems: DraftOrderLineItem[];
  customer?: DraftOrderCustomer;
  shippingAddress?: DraftOrderAddress;
  note?: string;
  tags?: string[];
  customAttributes?: { key: string; value: string }[];
}

async function adminQuery(query: string, variables: Record<string, any> = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || "";
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
  if (!domain || !token) {
    throw new Error(
      "Shopify Admin API credentials not configured (SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_ACCESS_TOKEN)"
    );
  }
  const url = `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error("Shopify Admin GraphQL errors:", JSON.stringify(json.errors));
    throw new Error(json.errors[0]?.message || "Shopify Admin API error");
  }
  return json.data;
}

export async function createDraftOrder(input: CreateDraftOrderInput) {
  const query = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          status
          totalPrice
          currencyCode
          createdAt
          customer {
            id
            email
            firstName
            lastName
          }
          lineItems(first: 20) {
            edges {
              node {
                id
                title
                quantity
                originalTotal
                variant {
                  id
                  title
                  price
                  image { url altText }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const draftInput: any = {
    lineItems: input.lineItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  };

  if (input.note) {
    draftInput.note = input.note;
  }

  if (input.tags?.length) {
    draftInput.tags = input.tags;
  }

  if (input.customAttributes?.length) {
    draftInput.customAttributes = input.customAttributes;
  }

  // Attach customer by email lookup or inline
  if (input.customer?.email) {
    draftInput.purchasingEntity = {
      customerId: undefined,
    };
    // Use email-based input instead - Shopify will find or create the customer
    draftInput.email = input.customer.email;
  }

  if (input.shippingAddress) {
    draftInput.shippingAddress = {
      address1: input.shippingAddress.address1 || "",
      city: input.shippingAddress.city || "",
      province: input.shippingAddress.province || "",
      zip: input.shippingAddress.zip || "",
      country: input.shippingAddress.country || "US",
      firstName: input.customer?.firstName || "",
      lastName: input.customer?.lastName || "",
      phone: input.customer?.phone || "",
    };
  }

  const data = await adminQuery(query, { input: draftInput });

  if (data.draftOrderCreate.userErrors?.length > 0) {
    throw new Error(data.draftOrderCreate.userErrors[0].message);
  }

  const draft = data.draftOrderCreate.draftOrder;
  return {
    id: draft.id,
    name: draft.name,
    status: draft.status,
    totalPrice: draft.totalPrice,
    currencyCode: draft.currencyCode,
    createdAt: draft.createdAt,
    customer: draft.customer,
    lineItems: draft.lineItems.edges.map((e: any) => e.node),
  };
}

// ========== SHOPIFYQL ANALYTICS ==========

export async function runShopifyqlQuery(shopifyql: string): Promise<any> {
  const query = `
    query shopifyqlQuery($query: String!) {
      shopifyqlQuery(query: $query) {
        __typename
        ... on TableResponse {
          tableData {
            unformattedData
            rowData
            columns {
              name
              dataType
              displayName
            }
          }
        }
        parseErrors {
          code
          message
        }
      }
    }
  `;

  const data = await adminQuery(query, { query: shopifyql });

  if (data.shopifyqlQuery.parseErrors?.length > 0) {
    throw new Error("ShopifyQL parse error: " + data.shopifyqlQuery.parseErrors[0].message);
  }

  if (data.shopifyqlQuery.__typename !== "TableResponse") {
    throw new Error("Unexpected ShopifyQL response type: " + data.shopifyqlQuery.__typename);
  }

  return data.shopifyqlQuery.tableData;
}

// POS Staff Daily Sales - matches the Shopify admin analytics report
export async function getPosStaffSales(sinceDays: number = 7): Promise<any> {
  const shopifyql = `
    FROM sales
    SHOW orders,
      average_order_value,
      gross_sales,
      discounts,
      returns,
      net_sales,
      shipping_charges,
      taxes,
      total_sales
    WHERE sales_channel = 'Point of Sale'
      AND staff_member_name IS NOT NULL
    GROUP BY staff_member_name, pos_location_name
    TIMESERIES day
    WITH TOTALS, GROUP_TOTALS
    SINCE startOfDay(-${sinceDays}d) UNTIL today
    ORDER BY day ASC, total_sales DESC
    LIMIT 1000
  `;

  const tableData = await runShopifyqlQuery(shopifyql);
  return parseShopifyqlTable(tableData);
}

// POS Staff Sales Summary (no daily timeseries, just totals per staff)
export async function getPosStaffSummary(sinceDays: number = 7): Promise<any> {
  const shopifyql = `
    FROM sales
    SHOW orders,
      average_order_value,
      gross_sales,
      discounts,
      returns,
      net_sales,
      taxes,
      total_sales
    WHERE sales_channel = 'Point of Sale'
      AND staff_member_name IS NOT NULL
    GROUP BY staff_member_name
    WITH TOTALS
    SINCE startOfDay(-${sinceDays}d) UNTIL today
    ORDER BY total_sales DESC
    LIMIT 100
  `;

  const tableData = await runShopifyqlQuery(shopifyql);
  return parseShopifyqlTable(tableData);
}

function parseShopifyqlTable(tableData: any): { columns: any[]; rows: any[] } {
  const { columns, rowData, unformattedData } = tableData;

  // rowData contains formatted strings, unformattedData contains raw values
  // Use unformattedData for numbers, rowData for display
  const data = unformattedData || rowData || [];

  const rows = data.map((row: any[]) => {
    const obj: Record<string, any> = {};
    columns.forEach((col: any, idx: number) => {
      obj[col.name] = row[idx];
    });
    return obj;
  });

  return { columns, rows };
}

export async function getDraftOrder(id: string) {
  const query = `
    query getDraftOrder($id: ID!) {
      draftOrder(id: $id) {
        id
        name
        status
        totalPrice
        currencyCode
        note
        tags
        createdAt
        customer {
          id
          email
          firstName
          lastName
        }
        lineItems(first: 20) {
          edges {
            node {
              id
              title
              quantity
              originalTotal
              variant {
                id
                title
                price
                image { url altText }
              }
            }
          }
        }
      }
    }
  `;

  const data = await adminQuery(query, { id });
  if (!data.draftOrder) return null;

  const draft = data.draftOrder;
  return {
    id: draft.id,
    name: draft.name,
    status: draft.status,
    totalPrice: draft.totalPrice,
    currencyCode: draft.currencyCode,
    note: draft.note,
    tags: draft.tags,
    createdAt: draft.createdAt,
    customer: draft.customer,
    lineItems: draft.lineItems.edges.map((e: any) => e.node),
  };
}
