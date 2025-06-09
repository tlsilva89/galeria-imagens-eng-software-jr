
export interface SelectTotalProps {
    total: number
}
export function pagination (request) {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const search = request.query.search || "";
  
    const offset = (page - 1) * limit;

    return {
        page,
        limit,
        search,
        offset
    }

}

export function countPage(pages, limit: number) {
    return  Math.ceil(Number(pages) / limit)
}