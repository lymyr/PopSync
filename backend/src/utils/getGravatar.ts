import { hash } from "node:crypto";

export default function getGravatar(username: string) {
    return `https://gravatar.com/avatar/${hash("sha256", username)}?d=identicon`
}