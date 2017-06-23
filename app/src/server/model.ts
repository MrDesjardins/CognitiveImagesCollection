// Main Vision
export interface IVisionModel {
    categories: ICategory[];
    tags: ITag[];
    description: IDescription;
    requestId: string;
    metadata: IMetadata;
    faces: IFaceVision[];
    color: IImageColor;
}
export interface ICategory {
    name: string;
    score: number;
}

export interface ITag {
    name: string;
    confidence: number;
}

export interface IDescription {
    tags: string[];
    captions: ICaptions[];
}

export interface ICaptions {
    text: string;
    confidence: number;
}

export interface IMetadata {
    width: number;
    height: number;
    format: string;
}

export interface IFaceVision {
    age: number;
    gender: string;
    faceRectangle: ICoordinatePixel
}

export interface ICoordinatePixel {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IImageColor {
    dominantColorForeground: string;
    dominantColorBackground: string;
    dominantColors: string[];
    accentColor: string;
    isBWImg: boolean;


}
// Main Face is an array of this interface
export interface IFace {
    faceId: string;
    faceRectangle: ICoordinatePixel;
    faceAttributes: IFaceAttribute;
}

export interface IFaceAttribute {
    smile: number;
    gender: string;
    age: number;
    facialHair: IFacialHair;
    glasses: string;
    emotion: IEmotion;
    accessories: string[];
    hair: IHair;
}

export interface IFacialHair {
    moustache: number;
    beard: number;
    sideburns: number;
}

export interface IEmotion {
    anger: number;
    contempt: number;
    disgust: number;
    fear: number;
    happiness: number;
    neutral: number;
    sadness: number;
    surprise: number;
}

export interface IHair {
    bald: number;
    invisible: boolean;
    hairColor: IHairColor[];
}

export interface IHairColor {
    color: string;
    confidence: number;
}

// Main Face Detection is an array of this interface
export interface IFaceDetection {
    displayName: string;
    personId: string;
    faceId: string;
}

export interface IFullMeta extends IVisionModel {
    people: IFaceWithDetection[]
    year: number;
    fullDate: string;
    manualTags: string[];
}

export interface IFaceWithDetection extends IFace {
    displayName: string;
    personId: string;
}