
import { IFilters, IResults, IResult } from "../models/filterModels";


/**
 * Get data from the web as the main source of truth
 */
export class ImageDataProvider {

    public readonly URL_PICTURES_API: string = "http://localhost:8080/api";

    private doRequest<T>(url: string, dataUrl: string, sucessCallback: (response) => T): Promise<T> {
        const that = this;
        const promise = new Promise<T>(
            (resolve, reject) => {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                const myInit = {
                    method: "GET",
                    headers: myHeaders,
                    cache: "default"
                } as RequestInit;

                fetch(url + "?" + dataUrl, myInit).then((reponse: Response) => {
                    const jsonResponse = reponse.json();
                    const data: T = sucessCallback(jsonResponse);
                    resolve(data);
                });
            });
        return promise;
    }

    private getParamsWithValues(pageNumber: number = 0, filters?: IFilters): string {
        let params = "pagenumber=" + pageNumber.toString();
        if (filters) {
            if (filters.tags && filters.tags.length > 0) {
                params = params + "&tags=" + filters.tags.join(",");
            }

            params = params + "&isblackandwhite=" + filters.isBlackAndWhite;
            params = params + "&smilelevel=" + filters.smileLevel;
            params = params + "&hapinesslevel=" + filters.happinessLevel;
            params = params + "&numberofpeople=" + filters.numberOfPeople;
            params = params + "&startdate=" + filters.startingDate.valueOf();
            params = params + "&enddate=" + filters.endingDate.valueOf();

            if (filters.peopleNames && filters.peopleNames.length > 0) {
                params = params + "&names=" + filters.peopleNames.join(",");
            }

            // params = params + "&order=" + filters.sortFieldName;
            // params = params + "&sort=" + (filters.sortDirection === SortDirection.ASC ? "ASC" : "DESC");
        }
        return params;
    }

    public getPicturesWithFilter(filter: IFilters, queueRequest: boolean = true, pageNumber?: number): Promise<IResults> {
        const params: string = this.getParamsWithValues(pageNumber, filter);
        return this.getPictures(this.URL_PICTURES_API, params);
    }

    protected getPictures(url: string, dataUrl: string): Promise<IResults> {
        const promise = this.doRequest<IResults>(url, dataUrl, (jsonObjectResponse: string) => Object.assign({} as IResults, jsonObjectResponse));
        return promise;
    }



}
