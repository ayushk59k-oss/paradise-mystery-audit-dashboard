// Fixed template for the Paradise Biryani mystery audit PDF.
// Each section lists its questions in exact PDF order.
// `match` = unique substring from the question text used to locate it in extracted text.
// `label` = short label used in the dashboard JSON (matches existing schema style).
// `scored: false` marks free-text / non-scored rows (skipped for score extraction).

const SECTIONS = [
  {
    key: 'Ambience',
    match: 'AMBIENCE, MAINTENANCE & CLEANLINESS',
    questions: [
      { label: 'Welcome & comfortable', match: 'did you feel', matchEnd: 'welcome and comfortable' },
      { label: 'Placards/lighting working', match: 'promotional placards and lighting' },
      { label: 'No flies/insects', match: 'no visible flies or insects' },
      { label: 'Entrance/counter clean', match: 'entrance, service counter and dining area' },
      { label: 'AC comfortable', match: 'air-conditioning temperature comfortable' },
      { label: 'Music volume comfortable', match: 'music being played at a comfortable volume' },
      { label: 'Restroom maintained', match: 'Restroom/ Washroom well maintained' },
      { label: 'Cleaning chart updated', match: 'cleaning chart displayed & updated' },
      { label: 'No tissues on floor', match: 'tissue / napkins lying on the' },
      { label: 'Signage clean & lit', match: 'restaurant signage clean, well maintained' },
    ],
    comment: { match: 'Please share your feedback' },
  },
  {
    key: 'Order Taking',
    match: 'ORDER TAKING PROCESS & CUSTOMER SERVICE STANDARDS',
    questions: [
      { label: 'Greeted promptly', match: 'greeted promptly by any other team member' },
      { label: 'Waiting time quoted', match: 'quoted an approx time of wait' },
      { label: 'Staff attentive', match: 'staff attentive to your table' },
      { label: 'Guided to table', match: 'guide you upto the table' },
      { label: 'Water bottle pre-placed', match: 'pre-placed water bottle on your table' },
      { label: 'Water preference asked', match: 'staff asked for water preference' },
      { label: 'Menu presented', match: 'staff present the menu upon being seated' },
      { label: 'Menu in good condition', match: 'menu in good condition & well maintained' },
      { label: 'Veg/non-veg asked', match: 'preference in terms of veg / non veg' },
      { label: 'All items available', match: 'Were all the menu items available' },
      { label: 'Order offered by staff', match: 'Service staff offer to take the order' },
      { label: 'Called staff for order', match: 'did you have to call the staff for the order' },
      { label: 'Suggestive selling done', match: 'did suggestive selling' },
      { label: 'Order repeated correctly', match: 'repeat the order correctly and quote a time' },
      { label: 'Staff introduced self', match: 'introduce himself and mentioned to you to call' },
      { label: 'Informed of delay', match: 'informed if there was any delay' },
      { label: 'Loyalty pass recommended', match: 'recommend you to purchase a loyalty pass' },
      { label: 'Dish announced before serving', match: 'announced the dish before serving' },
      { label: 'Satisfaction checked', match: 'captain or server check on your satisfaction' },
      { label: 'Staff pleasing smile', match: 'pleasing smile on their face' },
      { label: 'Finger bowl w/ lemon', match: 'finger bowl provided to you have lemon' },
      { label: 'Table cleared in 5 min', match: 'table clearance done within 5 mins' },
      { label: 'Staff well groomed', match: 'well groomed host, captains, servers' },
    ],
    comment: { match: 'Please share your feedback' },
  },
  {
    key: 'F&B Quality',
    match: 'FOOD & BEVERAGES QUALITY',
    questions: [
      { label: 'Quality standards met', match: 'food meet quality standards' },
      { label: 'Hot/cold served right temp', match: 'hot items served hot & cold items served cold' },
      { label: 'Taste satisfactory', match: 'satisfied with the taste' },
      { label: 'Correct condiments', match: 'correct condiments' },
      { label: 'Takeaway packing norms', match: "brand's prescribed packaging norms" },
    ],
    comment: { match: 'Please share your feedback' },
  },
  {
    key: 'Billing',
    match: 'BILLING PARAMETERS',
    questions: [
      { label: 'Hassle free', match: 'billing process hassle free' },
      { label: 'Contact details taken', match: 'contact details of the customer while billing' },
      { label: 'Billed within 90s', match: 'billing completed promptly' },
      { label: 'Multiple payment options', match: 'multiple payment options' },
      { label: 'Bill/receipt issued', match: 'bill/receipt not issued after the cash payment' },
      { label: 'Feedback via SMS/Google', match: 'requested for any feedback on sms link' },
      { label: 'Staff thanked at end', match: 'staff thanked at the end' },
    ],
    comment: { match: 'Please share your feedback' },
  },
  {
    key: 'Recommendation',
    match: 'RECOMMENDATION',
    questions: [
      { label: 'Memorable service', match: 'receive memorable service' },
      { label: 'Likelihood to recommend', match: 'how likely are you to recomend this food Outlet', outOf: 10 },
    ],
    comment: { match: 'Please comment on the positives and negatives of your overall experience.' },
  },
];

module.exports = { SECTIONS };
