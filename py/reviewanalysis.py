# categorizing reviews based on text content
# using keyword mapping in mapping.json, which was generated with chatgpt

import pandas as pd
import json

def load_jsonl(file_name):
    data = []
    with open(file_name, 'r') as f:
        for line in f:
            data.append(json.loads(line))
    return pd.DataFrame(data)

review_json = load_jsonl('../data/yelp_academic_dataset_review_top10.jsonl')

import re

def match_categories(plaintext, mapping):
    review_categories = {category: False for category in mapping}
    for category, keywords in mapping.items():
        for keyword in keywords:
            if re.search(rf"\b{re.escape(keyword)}\b", plaintext, re.IGNORECASE):
                review_categories[category] = True
                break  
    return review_categories


with open('mapping.json', 'r') as f:
    mapping_json = json.load(f)


for index, review in review_json.iterrows():
    plaintext = review["text"]
    matched_categories = match_categories(plaintext, mapping_json)
    for category, is_match in matched_categories.items():
        review_json.at[index, category] = is_match

# print(json.dumps(review_json, indent=2))

review_json.to_json('../data/yelp_academic_dataset_review_top10_categorized.jsonl', orient='records', lines=True)


# with open('reviews_categorized.json', 'w') as f:
#     json.dump(review, f)