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
    // chunk an array into smaller arrays of a given size and offset (for pagination) starting from the end and working backwards (for masonry)
    const result = [];
    for (let i = photos.length - offset; i > 0; i -= size) {
        result.push(photos.slice(Math.max(i - size, 0), i));
    }

    return result.reverse();
};

const RowsLayout = <T extends Photo = Photo>(props: RowsLayoutProps<T>): JSX.Element => {
    const { photos, layoutOptions, renderPhoto, renderRowContainer, componentsProps, instrumentation, pagination } =
        props;

    const { limit, offset } = pagination || {};

    const rows = useMemo(() => {
        const chunks = limit && offset ? chunkPhotos(photos, limit, offset) : [photos];
        return chunks.reduce((acc, photos) => {
            const rows = computeRowsLayout({ photos, layoutOptions, instrumentation });
            return [...(acc as []), ...(rows as [])];
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
