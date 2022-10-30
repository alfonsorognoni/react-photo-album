import computeRowsLayout, { RowsLayoutModel } from "../../layouts/rows";
import PhotoRenderer from "../renderers/PhotoRenderer";
import RowContainerRenderer from "../renderers/RowContainerRenderer";
import {
    ComponentsProps,
    Instrumentation,
    PaginationProps,
    Photo,
    RenderPhoto,
    RenderRowContainer,
    RowsLayoutOptions,
} from "../../types";
import { useMemo } from "react";

type RowsLayoutProps<T extends Photo = Photo> = {
    photos: T[];
    layoutOptions: RowsLayoutOptions;
    renderPhoto?: RenderPhoto<T>;
    renderRowContainer?: RenderRowContainer;
    componentsProps?: ComponentsProps;
    instrumentation?: Instrumentation;
    pagination?: PaginationProps;
};

//
const chunkPhotos = <T extends Photo = Photo>(photos: T[], size: number, offset: number) => {
    const result = [];
    for (let index = offset; index >= 1; index--) {
        const start = index * size;
        const end = size;

        if (index === 1) {
            result.push(photos.slice(-end * offset - 1));
        } else {
            result.push(photos.slice(start, end));
        }
    }
    return result.reverse();
};

const RowsLayout = <T extends Photo = Photo>(props: RowsLayoutProps<T>): JSX.Element => {
    const { photos, layoutOptions, renderPhoto, renderRowContainer, componentsProps, instrumentation, pagination } =
        props;

    const { limit, offset } = pagination || {};

    const rows = useMemo(() => {
        const chunks = limit && offset && offset > 1 ? chunkPhotos(photos, limit, offset) : [photos];
        return chunks.reduce((acc, photos) => {
            const rows = computeRowsLayout<T>({ photos, layoutOptions, instrumentation });
            return [...(acc as []), ...(rows || []).map((row) => row)];
        }, [] as RowsLayoutModel<T>);
    }, [limit, offset, photos, layoutOptions, instrumentation]);

    if (rows === undefined) return <></>;

    return (
        <>
            {rows.map((row, rowIndex) => (
                <RowContainerRenderer
                    key={`row-${rowIndex}`}
                    layoutOptions={layoutOptions}
                    rowIndex={rowIndex}
                    rowsCount={rows.length}
                    renderRowContainer={renderRowContainer}
                    rowContainerProps={componentsProps?.rowContainerProps}
                >
                    {row.map(({ photo, layout }) => (
                        <PhotoRenderer
                            key={photo.key || photo.src}
                            photo={photo}
                            layout={layout}
                            layoutOptions={layoutOptions}
                            renderPhoto={renderPhoto}
                            imageProps={componentsProps?.imageProps}
                        />
                    ))}
                </RowContainerRenderer>
            ))}
        </>
    );
};

export default RowsLayout;
