import computeColumnsLayout, { ColumnsLayoutModel } from "../../layouts/columns";
import PhotoRenderer from "../renderers/PhotoRenderer";
import ColumnContainerRenderer from "../renderers/ColumnContainerRenderer";
import {
    ColumnsLayoutOptions,
    ComponentsProps,
    Instrumentation,
    PaginationSliceProps,
    Photo,
    RenderColumnContainer,
    RenderPhoto,
} from "../../types";
import { useMemo } from "react";
import chunkPhotos from "../../utils/chunkPhotos";

type ColumnsLayoutProps<T extends Photo = Photo> = {
    photos: T[];
    layoutOptions: ColumnsLayoutOptions;
    renderPhoto?: RenderPhoto<T>;
    renderColumnContainer?: RenderColumnContainer;
    componentsProps?: ComponentsProps;
    instrumentation?: Instrumentation;
    pagination?: PaginationSliceProps;
};

const ColumnsLayout = <T extends Photo = Photo>(props: ColumnsLayoutProps<T>): JSX.Element => {
    const { photos, layoutOptions, renderPhoto, renderColumnContainer, componentsProps, instrumentation, pagination } =
        props;

    const columns = useMemo(() => {
        const chunks = pagination?.length ? chunkPhotos(photos, pagination) : [photos];
        return chunks.reduce((acc, photos) => {
            const columnsLayout = computeColumnsLayout<T>({
                photos,
                layoutOptions,
                instrumentation,
            });
            return {
                columnsModel: [...(acc?.columnsModel as []), ...(columnsLayout?.columnsModel || [])],
                columnsRatios: [...(acc?.columnsRatios as []), ...(columnsLayout?.columnsRatios as [])],
                columnsGaps: [...(acc?.columnsGaps as []), ...(columnsLayout?.columnsGaps as [])],
            };
        }, {} as ColumnsLayoutModel<T>);
    }, [pagination, photos, layoutOptions, instrumentation]);

    if (columns === undefined) return <></>;

    const { columnsModel, columnsRatios, columnsGaps } = columns;

    return (
        <>
            {columnsModel.map((column, columnIndex) => (
                <ColumnContainerRenderer
                    key={`column-${columnIndex}`}
                    layoutOptions={layoutOptions}
                    columnIndex={columnIndex}
                    columnsCount={columnsModel.length}
                    columnsGaps={columnsGaps}
                    columnsRatios={columnsRatios}
                    renderColumnContainer={renderColumnContainer}
                    columnContainerProps={componentsProps?.columnContainerProps}
                >
                    {column.map(({ photo, layout }) => (
                        <PhotoRenderer
                            key={photo.key || photo.src}
                            photo={photo}
                            layout={layout}
                            layoutOptions={layoutOptions}
                            renderPhoto={renderPhoto}
                            imageProps={componentsProps?.imageProps}
                        />
                    ))}
                </ColumnContainerRenderer>
            ))}
        </>
    );
};

export default ColumnsLayout;
