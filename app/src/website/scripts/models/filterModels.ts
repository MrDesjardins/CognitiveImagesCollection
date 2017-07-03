import { IFullMeta } from "../../../serveranalyzer/model";
export interface IFilters {
    tags: string[];
    isBlackAndWhite: boolean;
    startingDate: Date;
    endingDate: Date;
    numberOfPeople: number;

    smileLevel: number;
    happinessLevel: number;
    peopleName: string[];
}

export interface IResults {
    pictureResults: IResult[];
}

export interface IResult {
    meta: IFullMeta;
}

export interface IAppState {
    filters: IFilters;
    results: IResults;
}