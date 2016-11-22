export type ControlValue = number | boolean | string;

export interface IControlInfo {
    type: "slider" | "text" | "checkbox";
    name: string;
    description?: string;
    value?: ControlValue;
    min?: number;
    max?: number;
}

export interface IControlEvent {
    name: string;
    value: ControlValue;
}

export interface IMessageInfo {
    type: string;
    message: string;
}

export interface IFrameMessage {
    type: "message" | "control.add" | "control.event";
    message?: IMessageInfo;
    control?: IControlInfo;
    controlEvent?: IControlEvent;
}