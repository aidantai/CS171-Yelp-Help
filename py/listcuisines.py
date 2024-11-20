import pandas as pd
import json

def load_jsonl(file_name):
    data = []
    with open(file_name, 'r') as f:
        for line in f:
            data.append(json.loads(line))
    return data

business_json = load_jsonl('../data/yelp_academic_dataset_business.jsonl')


categories = {}
for business in business_json:
    if 'categories' in business and business['categories'] is not None:
        business['categories'] = business['categories'].split(', ')
    else:
        business['categories'] = []

    for category in business['categories']:
        if category in categories:
            categories[category] += 1
        else:
            categories[category] = 1

print(categories)
# save categories to yelp_academic_dataset_categories.json
with open('../data/yelp_academic_dataset_categories.json', 'w') as f:
    json.dump(categories, f)

cuisines_counted = {}
with open('../data/yelp_academic_dataset_cuisines.json', 'r') as f:
    cuisines = json.load(f)

    for cuisine in cuisines:
        if cuisine in categories:
            cuisines_counted[cuisine] = categories[cuisine]

    # sort cuisine_counted
    cuisines_counted = dict(sorted(cuisines_counted.items(), key=lambda x: x[1], reverse=True))

    print(cuisines_counted)

with open('../data/yelp_academic_dataset_cuisines.json', 'w') as f:
    json.dump(cuisines_counted, f)