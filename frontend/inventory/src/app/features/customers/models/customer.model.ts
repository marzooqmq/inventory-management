export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  district?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type: CustomerType;
  discount?: number;
}

export interface CustomerRequestDTO {
  name: string;
  phone: string;
  address?: string;
  district?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type: CustomerType;
  discount?: number;
}

export interface CustomerResponseDTO {
  id: number;
  name: string;
  phone: string;
  address?: string;
  district?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type: string;
  discount?: number;
}

export enum CustomerType {
  DISTRIBUTOR = 'DISTRIBUTOR',
  DEALER = 'DEALER',
  DIRECT_CUSTOMER = 'DIRECT_CUSTOMER'
}

export interface CustomerState {
  customers: CustomerResponseDTO[];
  selectedCustomer: CustomerResponseDTO | null;
  loading: boolean;
  error: string | null;
}
