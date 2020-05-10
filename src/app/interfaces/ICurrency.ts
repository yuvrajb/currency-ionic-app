export interface ICurrency {
    code: string;
    decimal_digits: number;
    name: string;
    name_plural: string;
    rounding: number;
    symbol: string;
    symbol_native: string;
    selected: boolean;
    show: boolean;
}
