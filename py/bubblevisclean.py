import json
from datetime import datetime


review_category_dated = {}
lines = 0

with open('../data/yelp_academic_dataset_review_top10_categorized.jsonl', 'r') as f:
    for line in f:
        lines += 1
        print(lines)
        review = json.loads(line)

        full_date = review["date"]
        # strip to date
        date_parse = datetime.strptime(full_date, "%Y-%m-%d %H:%M:%S")
        quarter = (date_parse.month - 1) // 3 # 0, 1, 2, 3
        quarter_month = quarter * 3 + 1 # 1, 4, 7, 10
        date = date_parse.strftime(f"%Y-{quarter_month:02d}")

        for key, value in review.items():
            if isinstance(value, bool):
                if value == True:
                    if date not in review_category_dated:
                        review_category_dated[date] = {}
                    if key not in review_category_dated[date]:
                        review_category_dated[date][key] = 0
                    review_category_dated[date][key] += 1

flattened_review_category_dated = []

for date, categories in review_category_dated.items():
    for category, count in categories.items():
        flattened_review_category_dated.append({
            "date": date,
            "category": category,
            "count": count
        })

# with open('../data/yelp_academic_dataset_review_top25_categorized_dated.json', 'w') as f:
#     json.dump(review_category_dated, f, indent=2)

with open('../data/rev_t10_categ_dated.json', 'w') as f:
    json.dump(flattened_review_category_dated, f, indent=2)
