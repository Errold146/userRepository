export class PaginationDto {

    private constructor(
        public readonly page: number,
        public readonly limit: number,
    ){}

    static create( page: number = 1, limit: number = 10 ): [ string?, PaginationDto? ] {

        if ( isNaN(page) ) return ['The page must be a number'];
        if ( isNaN(limit) ) return ['The limit must be a number'];
        if ( page <= 0 ) return ['The page must be greater than zero'];
        if ( limit <= 0 ) return ['The limit must be greater than zero'];

        return [ undefined, new PaginationDto( page, limit ) ]
    }
}