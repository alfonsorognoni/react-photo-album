import { Photo, PaginationSliceProps } from "../types";

const chunkPhotos = <T extends Photo = Photo>(photos: T[], pagination: PaginationSliceProps) => {
    const result = [];
    const totalPages = pagination.length;
    if (totalPages === 1) {
        result.push(photos);
    } else {
        for (let i = 0; i < totalPages; i++) {
            const start = i > 0 ? pagination[i - 1].limit : 0;
            const end = i > 0 ? pagination[i - 1].limit + pagination[i].limit : pagination[i].limit;
            result.push(photos.slice(start, end));
        }
    }
    return result;
};

export default chunkPhotos;
