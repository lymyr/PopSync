import { query } from "express-validator";
import Validation from "./Validation.ts";

export interface SearchQuery {
    query: string;
    type: "movies" | "series";
    page: number
}

export interface DetailsQuery {
    id: number
}

export default class MediaValidation extends Validation {
    static query = query("query").exists().withMessage("missing 'query' key").isLength({min: 1}).withMessage("query shouldn't be empty")
    static type = query("type").exists().withMessage("missing 'type' key").custom(type => type == "movies" || type == "series").withMessage("type should be limited to 'movies' or 'series'")
    static page = query("page").exists().withMessage("missing 'page' key").isInt({ min: 1, allow_leading_zeroes: false }).withMessage("page should be an integer greater than 0").toInt()

    static search = [this.query, this.type, this.page]

    static id = query("id").exists().withMessage("missing 'id' key").isInt().withMessage("id should be an integer").toInt()
}