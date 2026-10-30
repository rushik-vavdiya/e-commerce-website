// FAQ content for the storefront.
//
// The wording, the categories and the order of the questions now live in
// src/data/siteContent.json (key "faq.groups") — the single content file for
// the whole site — so the page component only reads them.
import { listContent } from './content';

export const faqGroups = listContent('faq.groups');
