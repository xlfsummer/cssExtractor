declare interface Da {
    name: string
    id: string
}


declare module "css" {
    export interface Rule{
        name: string
    }
}


declare var _variable: string;

declare interface _interface{
    someProperty: string
}

declare function _function(): string

declare class _class{
    someProperty: string
}