import { search } from "./search";

(async () => {
    const res = await search(process.argv[2]);

    console.log(res);
})();
