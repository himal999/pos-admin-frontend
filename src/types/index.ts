import { code } from "framer-motion/client";
import { JSX } from "react";

export interface IBaseRequest {
  channel: string;
  ip: string;
  message: string;
  username: string;
  userAgent: string;
}
export interface ILoginData {
  username: string;
  password: string;
}

export interface IResetPassword {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface IBaseResponse {
  success: boolean;
  message: string;
  data: Record<string, any> | null;
  errors: string | null;
  errorCode: number;
  responseTime: string;
}
export interface IUploadFile {
  file?: any;
  description?: string;
  workbook?: string;
  company?: string;
}

export interface IPages {
  code: string;
  description: string;
  pages: {
    code: string;
    url: string;
    description: string;
    status: string;
  }[];
}

export interface IUserProfile {
  username: string;
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  mobile: string;
  status: string;
  statusDescription: string;
  lastLoggedDate: string;
  expectingFirstTimeLogging: boolean;
  passwordExpiredDate: string;
  profileImg: {
    file: Base64URLString;
    fileExtensiones: string;
    fileName: string;
    type: "PROFILE";
  };
  userRole: {
    code: string;
    description: string;
  };
  reset: boolean;
}

export interface IProfileImage {
  type?: string;
  file?: any;
  fileName: string;
  fileExtensiones: string;
}
export interface IUpdateProfile {
  mobile: string;
  email: string;
}

export interface IPrivilages {
  page: string;
  userRole: string;
}
export interface IAssignTask {
  page: string;
  userRole: string;
  assignedTask: string;
}

export interface IFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    code: string;
    description: string;
    status: string;
  };
}

export interface ISectionItem {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}

export interface IPageItem {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}

export interface ITaskItem {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}

export interface IUserCreation {
  newUsername: string;
  userRole: string;
  nic: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
}

export interface IUserRole {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}
export interface IAddUserRole {
  code: string;
  description: string;
  status: string;
}

export interface IPasswordPolicy {
  id: number;
  minUpperCase: number;
  minLowerCase: number;
  minNumbers: number;
  minSpecialCharacters: number;
  minLength: number;
  maxLength: number;
  passwordHistory: number;
  attemptExceedCount: number;
  otpExceedCount: number;
}

export interface IUserPolicy {
  id: number;
  minUpperCase: number;
  minLowerCase: number;
  minNumbers: number;
  minSpecialCharacters: number;
  minLength: number;
  maxLength: number;
}

export interface IUserList {
  id: number;
  newUsername: string;
  email: string;
  status: string;
  statusDescription: string;
}

export interface IUserFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    newUsername: string;
    userRole: string;
    nic: string;
    email: string;
    mobile: string;
    firstName: string;
    lastName: string;
    status: string;
    loginStatus: string;
    company: {
      code: string;
      description: string;
    };
  };
}

export interface ICompanyGroup {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}
export interface IAddGroup {
  code: string;
  description: string;
  status: string;
}

export interface ICompany {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}
export interface IAddCompany {
  code: string;
  group: string;
  description: string;
  status: string;
}

export interface IAddSheetContent {
  sheetsList: {
    companyCode: string;
    sheetCode: string;
    description: string;
    status: string;
  }[];
}

export interface ICompanyFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    code: string;
    group: string;
    description: string;
    status: string;
  };
}

export interface IRequestPasswordOTP {
  username: string;
}

export interface IPasswordOTP {
  username: string;
  otp: string;
}

export interface IUploadIncomeBudget {
  year: string;
  month: string;
  company: string;
  file: any;
  workBookType: string;
  sheetType: string;
}
export interface IBrand {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}
export interface IAddBrand {
  code: string;
  description: string;
  status: string;
}
export interface ICategory {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
}
export interface IAddCategory {
  code: string;
  description: string;
  status: string;
}

export interface ISupplierList {
  id: number;
  title: string;
  titleDescription: string;
  status: string;
  statusDescription: string;
  firstName: string;
  lastName: string;
  primaryMobile: string;
  primaryEmail: string;
  company: string;
}
export interface ISupplierFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    firstName: string;
    lastName: string;
    primaryMobile: string;
    primaryEmail: string;
    company: string;
    status: string;
  };
}

export interface ISupplierCreation {
  title: string;
  firstName: string;
  lastName: string;
  primaryMobile: string;
  primaryEmail: string;
  company: string;
  status: string;
}

export interface IItem {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
  category: {
    code: string;
    description: string;
  };
  brand: {
    code: string;
    description: string;
  };
  unit: string;
  unitDescription: string;
}

export interface IAddItem {
  code: string;
  description: string;
  category: string;
  brand: string;
  status: string;
  unit: string;
}

export interface IItemFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    code: string;
    description: string;
    category: string;
    brand: string;
    unit: string;
    status: string;
  };
}

export interface ILocation {
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
  city: string;
  contactNumber: string;
  loactionType: string;
  locationTypeDescription: string;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface IAddLocation {
  code: string;
  description: string;
  city: string;
  contactNumber: string;
  status: string;
  locationType: string;
}

export interface ILocationFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    code: string;
    description: string;
    status: string;
    city: string;
    contactNumber: string;
    locationType: string;
  };
}

export interface IGRNFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    keyword: string;
  };
}

export interface IGRNItem {
  qty: number;
  wholesaleDiscount: number;
  customerDiscount: number;
  wholesalePrice: number;
  salePrice: number;
  itemCost: number;
  lablePrice: number;
  itemCode: string;
  id: number;
  code: string;
  description: string;
  status: string;
  statusDescription: string;
  category: {
    code: string;
    description: string;
  };
  brand: {
    code: string;
    description: string;
  };
  unit: string;
  unitDescription: string;
}

export interface IAddGRN {
  supplierId: string;
  locationCode: string;
  cost: number;
  debitAmount: number;
  creditAmount: number;
  grnDate: string;
  remark: string;
  dueDate: string;
  itemGRNS: {
    description: string;
    itemCode: string;
    lablePrice: number;
    itemCost: number;
    retailPrice: number;
    wholesalePrice: number;
    retailDiscount: number;
    wholesaleDiscount: number;
    qty: number;
    status: string;
  }[];
}

export interface ICartGRNItem {
  itemCode: string;
  description: string;
  lablePrice: number;
  itemCost: number;
  salePrice: number;
  wholesalePrice: number;
  customerDiscount: number;
  wholesaleDiscount: number;
  qty: number;
  status: string;
}

export interface IViewGRNItem {
  location: any;
  id: number;
  item: {
    id: number;
    code: string;
    description: string;
    status: string;
    statusDescription: string;
    category: {
      code: string;
      description: string;
    };
    brand: {
      code: string;
      description: string;
    };
    unit: string;
    unitDescription: string;
  };
  lablePrice: number;
  itemCost: number;
  retailPrice: number;
  wholesalePrice: number;
  retailDiscount: number;
  wholesaleDiscount: number;
  qty: number;
  grn: {
    id: number;
    cost: number;
    debitAmount: number | null;
    creditAmount: number | null;
    location: {
      createdDate: string;
      lastModifiedDate: string;
      createdBy: string;
      lastModifiedBy: string;
      id: number;
      code: string;
      description: string;
      status: string;
      statusDescription: string;
      city: string;
      contactNumber: string;
      locationType: string;
      locationTypeDescription: string;
    };
    remark: string | null;
    dueDate: string | null;
  };
  status: string;
  statusDescription: string;
}
[];

export interface IStock {
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
  id: number;
  item: {
    createdDate: string;
    lastModifiedDate: string;
    createdBy: string;
    lastModifiedBy: string;
    id: number;
    code: string;
    description: string;
    status: string;
    statusDescription: string;
    category: {
      code: string;
      description: string;
    };
    brand: {
      code: string;
      description: string;
    };
    unit: string;
    unitDescription: string;
  };
  lablePrice: number;
  itemCost: number;
  retailPrice: number;
  wholesalePrice: number;
  retailDiscount: number;
  wholesaleDiscount: number;
  qty: number;
  location: {
    createdDate: string;
    lastModifiedDate: string;
    createdBy: string;
    lastModifiedBy: string;
    id: number;
    code: string;
    description: string;
    status: string;
    statusDescription: string;
    city: string;
    contactNumber: string;
    locationType: string;
    locationTypeDescription: string;
  };
  status: string;
  statusDescription: string;
}

export interface IStockFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    location: string;
    itemCode: string;
    itemDescription: string;
    qty: string;
    qtyOperator: string;
    status: string;
  };
}

export interface ITransferItem {
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
  id: number;
  item: {
    createdDate: string;
    lastModifiedDate: string;
    createdBy: string;
    lastModifiedBy: string;
    id: number;
    code: string;
    description: string;
    status: string;
    statusDescription: string;
    category: {
      code: string;
      description: string;
    };
    brand: {
      code: string;
      description: string;
    };
    unit: string;
    unitDescription: string;
  };
  lablePrice: number;
  itemCost: number;
  retailPrice: number;
  wholesalePrice: number;
  retailDiscount: number;
  wholesaleDiscount: number;
  qty: number;
  location: {
    createdDate: string;
    lastModifiedDate: string;
    createdBy: string;
    lastModifiedBy: string;
    id: number;
    code: string;
    description: string;
    status: string;
    statusDescription: string;
    city: string;
    contactNumber: string;
    locationType: string;
    locationTypeDescription: string;
  };
  status: string;
  statusDescription: string;
}

export interface IAddTransfer {
  fromLocation: string;
  toLocation: string;
  senderRemark: string;
  transferItemList: {
    id: string;
    qty: number;
  }[];
}

export interface ITransferFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    fromLocation: string;
    code: string;
    description: string;
  };
}

export interface ICartTransferItem {
  id: string;
  itemCode: string;
  description: string;
  itemCost: number;
  qty: number;
}

export interface ITransfer {
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
  id: number;
  fromLocation: {
    code: string;
    description: string;
  };
  toLocation: {
    code: string;
    description: string;
  };
  senderRemark: string | null;
  accepts: any | null;
  acceptedDate: string | null;
  receivedRemark: string | null;
  status: string;
  statusDescription: string;
  transferStatus: string;
  transferStatusDescription: string;
  itemTransferDetails: {
    id: number;
    totCost: number;
    qty: number;
    item: {
      createdDate: string;
      lastModifiedDate: string;
      createdBy: string;
      lastModifiedBy: string;
      id: number;
      code: string;
      description: string;
      status: string;
      statusDescription: string;
      category: {
        code: string;
        description: string;
      };
      brand: {
        code: string;
        description: string;
      };
      unit: string;
      unitDescription: string;
    };
    lablePrice: number;
    retailPrice: number;
    wholesalePrice: number;
    retailDiscount: number;
    wholesaleDiscount: number;
  }[];
}

export interface ITransferStockFilter {
  page: number;
  size: number;
  sortColumn: string;
  sortDirection: string;
  search: {
    code: string;
    description: string;
    fromLocation: string;
    toLocation: string;
    fromDate: Date;
    toDate: Date;
    transferStatus: string;
    status: string;
  };
}


export interface ISummary {
  fromDate: string;
  toDate: string;
  locations: {
    [locationCode: string]: {
      summary: {
        totalReturns: number;
        totalCashIn: number;
        balance: number;
        totalSales: number;
        totalCashOut: number;
      };
      cashiers: {
        [cashierName: string]: {
          sales: {
            id: number;
            invoiceNumber: string;
            paymentType: string;
            paymentTypeDescription: string;
            customer: {
              title: string;
              titleDescription: string;
              firstName: string;
              lastName: string;
              city: string;
            };
            salesType: string;
            salesTypeDescription: string;
            totalAmount: number;
            payAmount: number;
            remark: string;
            salesDetailsResponseDTOList: any[] | null;
          }[];
          returns: any[];
          inOuts: {
            id: number;
            cashInOut: string;
            cashInOutDescription: string;
            remark: string;
            amount: number;
          }[];
          totalSales: number;
          totalReturns: number;
          totalCashIn: number;
          totalCashOut: number;
          balance: number;
        };
      };
    };
  };
  grandSummary: {
    totalReturns: number;
    totalCashIn: number;
    balance: number;
    totalSales: number;
    totalCashOut: number;
  };
}
