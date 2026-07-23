export type TFilter = {
  _id?: string;
  title: string;
  filterId: string;
  options: {
    optionId: string;
    value: string;
  }[];
};
