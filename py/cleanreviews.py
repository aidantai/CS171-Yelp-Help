# load 5gb file yelp_academic_dataset_review.jsonl into pandas dataframe
# load 100mb file yelp_academic_dataset_business.jsonl into pandas dataframe
# find top 10 most reviewed businesses from business.review_count
# filter reviews to only include reviews for top 10 most reviewed businesses
# save filtered reviews to yelp_academic_dataset_review_top.jsonl

import pandas as pd
import json

def load_jsonl(file_name):
    data = []
    with open(file_name, 'r') as f:
        for line in f:
            data.append(json.loads(line))
    return pd.DataFrame(data)

topn = 25

business_json = load_jsonl('../data/yelp_academic_dataset_business.jsonl')
print(business_json.head())
# find top 10 most reviewed businesses
top = business_json.nlargest(topn, 'review_count')
# save top 10 businesses to yelp_academic_dataset_business_top.jsonl
top.to_json('../data/yelp_academic_dataset_business_top.jsonl', orient='records', lines=True)

review_json = load_jsonl('../data/yelp_academic_dataset_review.jsonl')
print(review_json.head())
# filter reviews to only include reviews for top 10 most reviewed businesses
filtered_reviews = review_json[review_json['business_id'].isin(top['business_id'])]
print(filtered_reviews.head())
# save filtered reviews to yelp_academic_dataset_review_top.jsonl
filtered_reviews.to_json('../data/yelp_academic_dataset_review_top.jsonl', orient='records', lines=True)

