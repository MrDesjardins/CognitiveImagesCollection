export interface IPerson {
    /**
     * From the Training set directory
     */
    displayName: string;

    /**
     * From Azure
     */
    personId: string;

    trainingImagesPathFileName: string[];
}