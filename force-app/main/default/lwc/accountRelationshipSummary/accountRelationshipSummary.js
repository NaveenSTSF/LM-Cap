import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import ACCOUNT_NAME from "@salesforce/schema/Account.Name";
import ACCOUNT_INDUSTRY from "@salesforce/schema/Account.Industry";
import ACCOUNT_PHONE from "@salesforce/schema/Account.Phone";
import ACCOUNT_WEBSITE from "@salesforce/schema/Account.Website";

const ACCOUNT_FIELDS = [
  ACCOUNT_NAME,
  ACCOUNT_INDUSTRY,
  ACCOUNT_PHONE,
  ACCOUNT_WEBSITE
];

const CONTACT_FIELDS = [
  "Contact.Id",
  "Contact.Name",
  "Contact.Email",
  "Contact.Phone",
  "Contact.Title"
];

const OPPORTUNITY_FIELDS = [
  "Opportunity.Id",
  "Opportunity.Name",
  "Opportunity.StageName",
  "Opportunity.Amount",
  "Opportunity.CloseDate"
];

export default class AccountRelationshipSummary extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields: ACCOUNT_FIELDS })
  account;

  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Contacts",
    fields: CONTACT_FIELDS,
    pageSize: 5
  })
  contacts;

  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Opportunities",
    fields: OPPORTUNITY_FIELDS,
    pageSize: 5
  })
  opportunities;

  contactColumns = [
    {
      label: "Name",
      fieldName: "contactUrl",
      type: "url",
      typeAttributes: { label: { fieldName: "name" }, target: "_blank" }
    },
    { label: "Title", fieldName: "title" },
    { label: "Email", fieldName: "email", type: "email" },
    { label: "Phone", fieldName: "phone", type: "phone" }
  ];

  opportunityColumns = [
    {
      label: "Name",
      fieldName: "opportunityUrl",
      type: "url",
      typeAttributes: { label: { fieldName: "name" }, target: "_blank" }
    },
    { label: "Stage", fieldName: "stageName" },
    { label: "Amount", fieldName: "amount", type: "currency" },
    { label: "Close Date", fieldName: "closeDate", type: "date" }
  ];

  get accountName() {
    return getFieldValue(this.account.data, ACCOUNT_NAME);
  }

  get accountIndustry() {
    return getFieldValue(this.account.data, ACCOUNT_INDUSTRY) || "Not provided";
  }

  get accountPhone() {
    return getFieldValue(this.account.data, ACCOUNT_PHONE) || "Not provided";
  }

  get accountWebsite() {
    return getFieldValue(this.account.data, ACCOUNT_WEBSITE) || "Not provided";
  }

  get contactRows() {
    return this.getRows(
      this.contacts?.data?.records,
      "Contact",
      (fields, id) => ({
        id,
        contactUrl: `/${id}`,
        name: fields.Name?.value,
        title: fields.Title?.value,
        email: fields.Email?.value,
        phone: fields.Phone?.value
      })
    );
  }

  get opportunityRows() {
    return this.getRows(
      this.opportunities?.data?.records,
      "Opportunity",
      (fields, id) => ({
        id,
        opportunityUrl: `/${id}`,
        name: fields.Name?.value,
        stageName: fields.StageName?.value,
        amount: fields.Amount?.value,
        closeDate: fields.CloseDate?.value
      })
    );
  }

  get hasContacts() {
    return this.contactRows.length > 0;
  }

  get hasOpportunities() {
    return this.opportunityRows.length > 0;
  }

  get accountError() {
    return this.account?.error
      ? this.formatError(this.account.error)
      : undefined;
  }

  get contactsError() {
    return this.contacts?.error
      ? this.formatError(this.contacts.error)
      : undefined;
  }

  get opportunitiesError() {
    return this.opportunities?.error
      ? this.formatError(this.opportunities.error)
      : undefined;
  }

  getRows(records, objectName, mapRecord) {
    return (records || []).map((record) => {
      const fields = record.fields;
      const id = record.id || fields.Id?.value;
      return mapRecord(fields, id);
    });
  }

  formatError(error) {
    return (
      error?.body?.message ||
      error?.message ||
      "Unable to load this information."
    );
  }
}
