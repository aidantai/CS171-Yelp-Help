import pandas as pd
import json

def load_jsonl(file_name):
    data = []
    with open(file_name, 'r') as f:
        for line in f:
            data.append(json.loads(line))
    return pd.DataFrame(data)

review_json = load_jsonl('../data/yelp_academic_dataset_review_top25_categorized.jsonl')

with open('mapping.json', 'r') as f:
    mapping = json.load(f)

categories = list(mapping.keys())

category_counts = review_json[categories].sum().to_dict()

with open('../data/wordcloud_top25.json', 'w') as f:
    json.dump(category_counts, f, indent=2)

print(category_counts)