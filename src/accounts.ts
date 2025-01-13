type AccountInfo = {
  location: string;
  poNumber: string;
  accountCode: string;
};

export const accounts: Record<number, AccountInfo> = {
  1211202: { location: "ADMIN BLDG", poNumber: "24000826", accountCode: "100.2540.0412.001.000.000" },
  1668905: { location: "ATFALATI", poNumber: "24000826", accountCode: "100.2540.0412.228.000.000" },
  1211137: { location: "BROOKWOOD", poNumber: "24000826", accountCode: "100.2540.0412.122.000.000" },
  1211230: { location: "BROWN", poNumber: "24000826", accountCode: "100.2540.0412.506.000.000" },
  1211148: { location: "BUTTERNUT", poNumber: "24000826", accountCode: "100.2540.0412.125.000.000" },
  1211186: { location: "CENTURY", poNumber: "24000826", accountCode: "100.2540.0412.610.000.000" },
  1211203: { location: "CTS/Peter Boscow", poNumber: "24000826", accountCode: "100.2540.0412.0.000.000" },
  1211159: { location: "EASTWOOD", poNumber: "24000826", accountCode: "100.2540.0412.160.000.000" },
  1211241: { location: "EVERGREEN", poNumber: "24000826", accountCode: "100.2540.0412.508.000.000" },
  1211170: { location: "FARMINGTON VIEW", poNumber: "24000826", accountCode: "100.2540.0412.164.000.000" },
  1211180: { location: "FREE ORCHARDS", poNumber: "24000826", accountCode: "100.2540.0412.247.000.000" },
  1211197: { location: "GLENCOE", poNumber: "24000826", accountCode: "100.2540.0412.612.000.000" },
  1211181: { location: "GRONER", poNumber: "24000826", accountCode: "100.2540.0412.182.000.000" },
  1211207: { location: "HARE FIELD", poNumber: "24000826", accountCode: "100.2540.0412.035.000.000" },
  1211208: { location: "HILHI", poNumber: "24000826", accountCode: "100.2540.0412.620.000.000" },
  1211182: { location: "IMLAY", poNumber: "24000826", accountCode: "100.2540.0412.123.000.000" },
  1211183: { location: "INDIAN HILL", poNumber: "24000826", accountCode: "100.2540.0412.132.000.000" },
  1211184: { location: "JACKSON", poNumber: "24000826", accountCode: "100.2540.0412.172.000.000" },
  1211185: { location: "LADD ACRES", poNumber: "24000826", accountCode: "100.2540.0412.239.000.000" },
  1211187: { location: "LENOX", poNumber: "24000826", accountCode: "100.2540.0412.186.000.000" },
  1211219: { location: "LIBERTY", poNumber: "24000826", accountCode: "100.2540.0412.614.000.000" },
  1211188: { location: "LINCOLN STREET", poNumber: "24000826", accountCode: "100.2540.0412.152.000.000" },
  1211206: { location: "MEC EAST/CTS HOU", poNumber: "24000826", accountCode: "100.2540.0412.650.000.000" },
  1211190: { location: "MINTER BRIDGE", poNumber: "24000826", accountCode: "100.2540.0412.208.000.000" },
  1211191: { location: "MOOBERRY", poNumber: "24000826", accountCode: "100.2540.0412.213.000.000" },
  1211192: { location: "NORTH PLAINS", poNumber: "24000826", accountCode: "100.2540.0412.216.000.000" },
  1211205: { location: "OAK STREET", poNumber: "24000826", accountCode: "100.2540.0412.650.000.000" },
  1211193: { location: "ORENCO", poNumber: "24000826", accountCode: "100.2540.0412.218.000.000" },
  1211194: { location: "PATTERSON", poNumber: "24000826", accountCode: "100.2540.0412.146.000.000" },
  1211252: { location: "POYNTER", poNumber: "24000826", accountCode: "100.2540.0412.512.000.000" },
  1211195: { location: "QUATAMA", poNumber: "24000826", accountCode: "100.2540.0412.195.000.000" },
  1211323: { location: "REEDVILLE", poNumber: "24000826", accountCode: "100.2540.0412.140.000.000" },
  1211196: { location: "ROSEDALE", poNumber: "24000826", accountCode: "100.2540.0412.272.000.000" },
  1211263: { location: "SOUTH MEADOWS", poNumber: "24000826", accountCode: "100.2540.0412.514.000.000" },
  1843630: { location: "TAMARACK", poNumber: "24000826", accountCode: "100.2540.0412.229.000.000" },
  1211198: { location: "TOBIAS", poNumber: "24000826", accountCode: "100.2540.0412.175.000.000" },
  1211209: { location: "TRANSPORTATION", poNumber: "24000826", accountCode: "100.2540.0412.005.000.000" },
  1308527: { location: "TSSF", poNumber: "24000826", accountCode: "100.2540.0412.015.000.000" },
  1211189: { location: "W VERNE MCKINNEY", poNumber: "24000826", accountCode: "100.2540.0412.190.000.000" },
  1211199: { location: "WEST UNION", poNumber: "24000826", accountCode: "100.2540.0412.258.000.000" },
  1211200: { location: "WITCH HAZEL", poNumber: "24000826", accountCode: "100.2540.0412.264.000.000" },
  1211201: { location: "WL HENRY", poNumber: "24000826", accountCode: "100.2540.0412.253.000.000" },
  1087504: { location: "REPAIR & MAINTENANCE", poNumber: "24000658", accountCode: "100.2540.0322.006.000.000" }
};

type AmbiguousOptios = { key: string, label: string, data: AccountInfo }[];

export const ambiguousOptions: AmbiguousOptios = [
  { key: "general-supplies", label: "General Custodial Supplies", data: { location: "Facilites", poNumber: "24000826", accountCode: "100.2540.0412.006.000.000" } },
  { key: "in-person-orders", label: "In-Person Orders", data: { location: "Facilites", poNumber: "24000657", accountCode: "100.2540.0412.006.000.000" } },
  { key: "grant-product", label: "Grant - Product", data: { location: "Facilites", poNumber: "24001883", accountCode: "254.2540.0410.006.094.490" } },
  { key: "grant-dispenser", label: "Grant - Dispenser", data: { location: "Facilites", poNumber: "24001883", accountCode: "254.2540.0410.006.095.490" } },
]