import { INumberFormatterOptions } from "./INumberFormatterOptions";
export declare class NumberFormatter {
    private superscripts;
    private options;
    constructor(settings: INumberFormatterOptions);
    format(originalInput: any): string;
    toSuperscript(exponent: string): string;
    removeTrailingZeroesAfterDecimal(input: string): string;
}
