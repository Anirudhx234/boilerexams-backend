export default {
    "tabWidth": 4,
    "semi": true,
    "printWidth": 140,
    "trailingComma": "none",
    "importOrder": [
        "^express$",
        "^@prisma(.*)$",
        "<THIRD_PARTY_MODULES>",
        "^(.*)prisma",
        "(.*)helpers(.*)",
        "(.*)middleware(.*)",
        "^[./]"
    ],
    "plugins": ["@trivago/prettier-plugin-sort-imports"]
}
