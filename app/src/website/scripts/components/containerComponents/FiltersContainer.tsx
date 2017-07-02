import { connect, Dispatch } from "react-redux";
import { updateFilter } from "../../redux/actionsCreator";
import { FiltersPresentation, IFiltersPresentationProps } from "../presentationComponents/FiltersPresentation";
import { IFilters } from "../../models/filterModels";

const mapStateToProps = (state: IFilters): IFiltersPresentationProps => {
    return {
        filters: state
    } as IFiltersPresentationProps;
}

const mapDispatchToProps = (dispatch: Dispatch<IFilters>) => {
    return {
        onApply: (filters: IFilters) => {
            dispatch(updateFilter(filters));
        }
    };
};

const FiltersContainer: React.ComponentClass = connect(
    mapStateToProps,
    mapDispatchToProps
)(FiltersPresentation);

export default FiltersContainer;
