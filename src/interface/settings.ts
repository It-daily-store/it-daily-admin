import { TUser } from "./auth.interface";

export interface PcPart {
  id: number;
  name: string;
  category?: string;
  isRequired: boolean;
}

export interface PcCategory {
  title: string;
  parts: PcPart[];
}

export interface PcBuildSettings {
  coreComponents: PcCategory;
  peripherals: PcCategory;
}

export interface ISettings {
  pcBuilder: PcBuildSettings;
  lastUpdatedBy?: TUser;
}
