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
    base_value: number;
    multiplier: number;
    total_value: number;
    total_value_str: string;
}
