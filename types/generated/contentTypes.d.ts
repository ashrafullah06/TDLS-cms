import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminAuditLog extends Schema.CollectionType {
  collectionName: 'strapi_audit_logs';
  info: {
    displayName: 'Audit Log';
    pluralName: 'audit-logs';
    singularName: 'audit-log';
  };
  options: {
    draftAndPublish: false;
    timestamps: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::audit-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    date: Attribute.DateTime & Attribute.Required;
    payload: Attribute.JSON;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::audit-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<'admin::audit-log', 'oneToOne', 'admin::user'>;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface AdminWorkflow extends Schema.CollectionType {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Attribute.JSON & Attribute.Required & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::workflow',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    stages: Attribute.Relation<
      'admin::workflow',
      'oneToMany',
      'admin::workflow-stage'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::workflow',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminWorkflowStage extends Schema.CollectionType {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Attribute.String & Attribute.DefaultTo<'#4945FF'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::workflow-stage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String;
    permissions: Attribute.Relation<
      'admin::workflow-stage',
      'manyToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::workflow-stage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow: Attribute.Relation<
      'admin::workflow-stage',
      'manyToOne',
      'admin::workflow'
    >;
  };
}

export interface ApiAboutAbout extends Schema.CollectionType {
  collectionName: 'abouts';
  info: {
    displayName: 'about';
    pluralName: 'abouts';
    singularName: 'about';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content: Attribute.Blocks;
    cover_image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::about.about',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    publishedAt: Attribute.DateTime;
    seo_description: Attribute.Text;
    slug: Attribute.UID<'api::about.about', 'title'>;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::about.about',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAgeGroupAgeGroup extends Schema.CollectionType {
  collectionName: 'age_groups';
  info: {
    description: '';
    displayName: 'age_group';
    pluralName: 'age-groups';
    singularName: 'age-group';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audience_categories: Attribute.Relation<
      'api::age-group.age-group',
      'manyToMany',
      'api::audience-category.audience-category'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::age-group.age-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    gender_groups: Attribute.Relation<
      'api::age-group.age-group',
      'manyToMany',
      'api::gender-group.gender-group'
    >;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::age-group.age-group',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::age-group.age-group', 'name'>;
    unit: Attribute.Enumeration<['months', 'years']>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::age-group.age-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAudienceCategoryAudienceCategory
  extends Schema.CollectionType {
  collectionName: 'audience_categories';
  info: {
    description: '';
    displayName: 'audience category';
    pluralName: 'audience-categories';
    singularName: 'audience-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    age_groups: Attribute.Relation<
      'api::audience-category.audience-category',
      'manyToMany',
      'api::age-group.age-group'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::audience-category.audience-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    events_products_collections: Attribute.Relation<
      'api::audience-category.audience-category',
      'manyToMany',
      'api::events-products-collection.events-products-collection'
    >;
    name: Attribute.String & Attribute.Required;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::audience-category.audience-category',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::audience-category.audience-category', 'name'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::audience-category.audience-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBrandTierBrandTier extends Schema.CollectionType {
  collectionName: 'brand_tiers';
  info: {
    displayName: 'brand_tier';
    pluralName: 'brand-tiers';
    singularName: 'brand-tier';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::brand-tier.brand-tier',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Blocks;
    is_active: Attribute.Boolean;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::brand-tier.brand-tier',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::brand-tier.brand-tier', 'name'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::brand-tier.brand-tier',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    description: '';
    displayName: 'category';
    pluralName: 'categories';
    singularName: 'category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    category_code: Attribute.String;
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    hs_code: Attribute.String;
    is_active: Attribute.Boolean;
    is_featured: Attribute.Boolean;
    name: Attribute.String & Attribute.Required;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    short_description: Attribute.Blocks;
    slug: Attribute.UID<'api::category.category', 'name'>;
    tags: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::tag.tag'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiContactContact extends Schema.CollectionType {
  collectionName: 'contacts';
  info: {
    displayName: 'contact';
    pluralName: 'contacts';
    singularName: 'contact';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    address: Attribute.Blocks;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::contact.contact',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email;
    map_embed_code: Attribute.Text;
    phone: Attribute.String;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::contact.contact', 'title'>;
    social_links: Attribute.Component<'contact.social-links'>;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::contact.contact',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEventsProductsCollectionEventsProductsCollection
  extends Schema.CollectionType {
  collectionName: 'events_products_collections';
  info: {
    description: '';
    displayName: 'Events_Products_Collection';
    pluralName: 'events-products-collections';
    singularName: 'events-products-collection';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audience_categories: Attribute.Relation<
      'api::events-products-collection.events-products-collection',
      'manyToMany',
      'api::audience-category.audience-category'
    >;
    banner_image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    cover_image: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::events-products-collection.events-products-collection',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Blocks;
    end_datetime: Attribute.DateTime;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::events-products-collection.events-products-collection',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<
      'api::events-products-collection.events-products-collection',
      'name'
    >;
    start_datetime: Attribute.DateTime;
    type: Attribute.Enumeration<
      ['pahela boishak', 'eid festival', 'happy new year']
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::events-products-collection.events-products-collection',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFactoryFactory extends Schema.CollectionType {
  collectionName: 'factories';
  info: {
    description: 'Manufacturing factories for TDLC products';
    displayName: 'Factory';
    pluralName: 'factories';
    singularName: 'factory';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    address: Attribute.Text;
    code: Attribute.String & Attribute.Unique;
    contact_person: Attribute.String;
    country: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::factory.factory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email;
    is_active: Attribute.Boolean;
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    phone: Attribute.String;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::factory.factory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGatewayFeeScheduleGatewayFeeSchedule
  extends Schema.CollectionType {
  collectionName: 'gateway_fee_schedules';
  info: {
    displayName: 'gateway_fee_schedule';
    pluralName: 'gateway-fee-schedules';
    singularName: 'gateway-fee-schedule';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    cap_fee: Attribute.Decimal;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::gateway-fee-schedule.gateway-fee-schedule',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    effective_from: Attribute.DateTime;
    effective_to: Attribute.DateTime;
    fixed: Attribute.Decimal;
    min_fee: Attribute.Decimal;
    notes: Attribute.Blocks;
    pct: Attribute.Decimal;
    provider: Attribute.Enumeration<
      [
        'SSL_COMMERZ',
        'BKASH',
        'NAGAD',
        'CASH_ON_DELIVERY',
        'STRIPE',
        'MANUAL',
        'SHOPPING_ATM_CARD',
        'DEBIT_CARD',
        'MASTER_CARD',
        'VISA_CARD',
        'AMEX_CARD',
        'CREDIT_CARD'
      ]
    >;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::gateway-fee-schedule.gateway-fee-schedule',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGenderGroupGenderGroup extends Schema.CollectionType {
  collectionName: 'gender_groups';
  info: {
    description: '';
    displayName: 'gender_group';
    pluralName: 'gender-groups';
    singularName: 'gender-group';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    age_groups: Attribute.Relation<
      'api::gender-group.gender-group',
      'manyToMany',
      'api::age-group.age-group'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::gender-group.gender-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Blocks;
    gender_group: Attribute.Enumeration<
      ['baby girl', 'baby boy', 'teen girl', 'teen boy']
    >;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::gender-group.gender-group',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::gender-group.gender-group', 'name'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::gender-group.gender-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGlobalSettingGlobalSetting extends Schema.SingleType {
  collectionName: 'global_settings';
  info: {
    description: '';
    displayName: 'global-setting';
    pluralName: 'global-settings';
    singularName: 'global-setting';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    about_us: Attribute.Blocks;
    affiliate_program_info: Attribute.Blocks;
    allocation_method: Attribute.Enumeration<['REVENUE_SHARE', 'QUANTITY']>;
    api_status_page_url: Attribute.String;
    autofill_enabled: Attribute.Boolean;
    brand_story: Attribute.Blocks;
    business_registration_number: Attribute.String;
    cancellation_policy: Attribute.Blocks;
    career_info: Attribute.Blocks;
    category_code_rules: Attribute.String;
    contact_email: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::global-setting.global-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    customer_support_phone: Attribute.String;
    data_protection_policy: Attribute.Blocks;
    default_backorder_allowed: Attribute.Boolean;
    default_currency: Attribute.Enumeration<['BDT']>;
    default_meta_description: Attribute.Blocks;
    default_meta_title: Attribute.String;
    default_reorder_level: Attribute.Integer;
    default_tax_rate: Attribute.Decimal;
    default_warehouse_location: Attribute.Enumeration<['Dhaka']>;
    digital_wallet_policy: Attribute.Blocks;
    discount_policy: Attribute.Blocks;
    facebook_url: Attribute.String;
    faq_url: Attribute.String;
    finance_banner_message: Attribute.String;
    gift_card_policy: Attribute.Blocks;
    google_analytics_id: Attribute.String;
    instagram_url: Attribute.String;
    legal_disclaimer: Attribute.Blocks;
    live_chat_enabled: Attribute.Boolean;
    loyalty_program_info: Attribute.Blocks;
    maintenance_mode: Attribute.Boolean;
    margin_defaul: Attribute.Decimal;
    mobile_app_download_url: Attribute.String;
    newsletter_signup_url: Attribute.String;
    operating_hours: Attribute.String;
    order_policy: Attribute.Blocks;
    payment_policy: Attribute.Blocks;
    prices_are_tax_inclusive: Attribute.Boolean;
    privacy_policy: Attribute.Blocks;
    publishedAt: Attribute.DateTime;
    redeem_policy: Attribute.Blocks;
    refund_policy: Attribute.Blocks;
    return_and_exchange_policy: Attribute.Blocks;
    rounding_rule: Attribute.Enumeration<['LINE_2DP_THEN_SUM', 'SUM_THEN_2DP']>;
    shipping_policy: Attribute.Blocks;
    site_launch_date: Attribute.DateTime;
    sitemap_url: Attribute.String;
    sku_format: Attribute.String;
    store_location_google_map: Attribute.String;
    supplier_policy: Attribute.Blocks;
    support_hours: Attribute.String;
    terms_and_conditions: Attribute.Blocks;
    twitter_url: Attribute.String;
    unsold_default: Attribute.Decimal;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::global-setting.global-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    voucher_policy: Attribute.Blocks;
    whatsapp_support_number: Attribute.String;
    youtube_url: Attribute.String;
  };
}

export interface ApiHomepageHomepage extends Schema.SingleType {
  collectionName: 'homepages';
  info: {
    description: '';
    displayName: 'homepage';
    pluralName: 'homepages';
    singularName: 'homepage';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::homepage.homepage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    hero_slides: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_1: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_10: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_11: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_12: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_2: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_3: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_4: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_5: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_6: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_7: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_8: Attribute.Component<'sections.hero-slides-1', true>;
    hero_slides_9: Attribute.Component<'sections.hero-slides-1', true>;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::homepage.homepage',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLoyaltypointhistoryLoyaltypointhistory
  extends Schema.SingleType {
  collectionName: 'loyaltypointhistories';
  info: {
    displayName: 'loyaltypointhistory';
    pluralName: 'loyaltypointhistories';
    singularName: 'loyaltypointhistory';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    activity: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::loyaltypointhistory.loyaltypointhistory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    date: Attribute.DateTime;
    points: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::loyaltypointhistory.loyaltypointhistory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users_permissions_user: Attribute.Relation<
      'api::loyaltypointhistory.loyaltypointhistory',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    description: '';
    displayName: 'order';
    pluralName: 'orders';
    singularName: 'order';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    archive_record: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'api::archive-record.archive-record'
    >;
    billing_address: Attribute.Component<
      'order-components.address-snapshot',
      true
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    invoice_url: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    order_id: Attribute.UID;
    payment_method: Attribute.Enumeration<
      [
        'cash_on_delivery',
        'bkash',
        'nagad',
        'rocket',
        'visa_card',
        'amex',
        'master_card',
        'gpay'
      ]
    >;
    payment_status: Attribute.Enumeration<
      [
        'unpaid',
        'paid',
        'pending',
        'failed',
        'refunded_to_mfs_or_bank_account',
        'refunded_to_customer_digital_tdlc_wallet',
        'paid_from_customer_digital_tdlc_wallet'
      ]
    >;
    placed_at: Attribute.DateTime;
    product_items: Attribute.Component<'order-components.product-items', true>;
    publishedAt: Attribute.DateTime;
    shipping_address: Attribute.Component<'order-components.address-snapshot'>;
    status: Attribute.Enumeration<
      [
        'pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
        'exchanged',
        'refunded',
        'processing'
      ]
    >;
    total_amount: Attribute.Decimal;
    transaction_id: Attribute.UID;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiOverheadOverhead extends Schema.CollectionType {
  collectionName: 'overheads';
  info: {
    displayName: 'overhead';
    pluralName: 'overheads';
    singularName: 'overhead';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    annual_amount: Attribute.Decimal;
    bucket: Attribute.Enumeration<
      [
        'RENT',
        '  WAREHOUSE_RENT',
        '  UTILITIES_BASE',
        '  SALARIES_ADMIN',
        '  SECURITY_CLEANING',
        '  DECORATION_FITOUT',
        '  FURNITURE_FIXTURES',
        '  AC_FAN',
        '  MACHINES_ELECTRIC',
        '  IT_EQUIPMENT',
        '  WEBSITE_DEV',
        '  WEBSITE_HOSTING',
        '  ACCOUNTING_COMPLIANCE',
        '  INSURANCE',
        '  FINANCING_INTEREST',
        '  MISC'
      ]
    >;
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::overhead.overhead',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    depreciation_years: Attribute.Integer;
    effective_from: Attribute.Date;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::overhead.overhead',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPolicyPolicy extends Schema.CollectionType {
  collectionName: 'policies';
  info: {
    displayName: 'policy';
    pluralName: 'policies';
    singularName: 'policy';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::policy.policy',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Blocks;
    is_active: Attribute.Boolean;
    last_updated_by_personnel: Attribute.DateTime;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::policy.policy', 'name'>;
    title: Attribute.Enumeration<
      [
        'return and exchange policy',
        'shipping policy',
        'privacy policy',
        'point redemption policy',
        'digital currency policy',
        'refund policy'
      ]
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::policy.policy',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductCostingOverrideProductCostingOverride
  extends Schema.CollectionType {
  collectionName: 'product_costing_overrides';
  info: {
    description: '';
    displayName: 'product_costing_override';
    pluralName: 'product-costing-overrides';
    singularName: 'product-costing-override';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product-costing-override.product-costing-override',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    effective_from: Attribute.DateTime;
    effective_to: Attribute.DateTime;
    expected_free_ship_subsidy_unit: Attribute.Decimal;
    handling_cost: Attribute.Decimal;
    inbound_transport_cost: Attribute.Decimal;
    labor_cost: Attribute.Decimal;
    materials_cost: Attribute.Decimal;
    misc_direct_cost: Attribute.Decimal;
    notes: Attribute.Blocks;
    packaging_cost: Attribute.Decimal;
    publishedAt: Attribute.DateTime;
    quality_control_cost: Attribute.Decimal;
    reship_cost_avg: Attribute.Decimal;
    reship_rate: Attribute.Decimal;
    storage_cost: Attribute.Decimal;
    target_margin_override: Attribute.Decimal;
    unsold_pct_override: Attribute.Decimal;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::product-costing-override.product-costing-override',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    vat_rate_override: Attribute.Decimal;
  };
}

export interface ApiProductCourierRateCardProductCourierRateCard
  extends Schema.CollectionType {
  collectionName: 'product_courier_rate_cards';
  info: {
    displayName: 'product_courier_rate_card';
    pluralName: 'product-courier-rate-cards';
    singularName: 'product-courier-rate-card';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    courier_code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product-courier-rate-card.product-courier-rate-card',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    effective_from: Attribute.DateTime;
    effective_to: Attribute.DateTime;
    first_ship_cost: Attribute.Decimal;
    notes: Attribute.Blocks;
    products: Attribute.Relation<
      'api::product-courier-rate-card.product-courier-rate-card',
      'oneToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    reship_cost: Attribute.Decimal;
    service_code: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::product-courier-rate-card.product-courier-rate-card',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    zone: Attribute.String;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    description: 'Product catalog for The DNA Lab Clothing';
    displayName: 'Product';
    pluralName: 'products';
    singularName: 'product';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    graphql: {
      enabled: false;
    };
  };
  attributes: {
    age_groups: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::age-group.age-group'
    >;
    alt_names_entries: Attribute.Component<'common.alt-name', true>;
    audience_categories: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::audience-category.audience-category'
    >;
    barcode: Attribute.String & Attribute.Unique;
    base_sku: Attribute.String;
    brand_tiers: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::brand-tier.brand-tier'
    >;
    care_instructions: Attribute.RichText;
    categories: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::category.category'
    >;
    color_code: Attribute.String;
    compare_price: Attribute.Decimal;
    country_of_origin: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    creator: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    >;
    currency: Attribute.Enumeration<
      ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'CNY']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'BDT'>;
    description: Attribute.RichText;
    disable_frontend: Attribute.Boolean & Attribute.DefaultTo<false>;
    events_products_collections: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::events-products-collection.events-products-collection'
    >;
    factory: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'api::factory.factory'
    >;
    factory_base_cost: Attribute.Decimal &
      Attribute.Private &
      Attribute.DefaultTo<0>;
    factory_batch_code: Attribute.String & Attribute.Private;
    fit: Attribute.Enumeration<
      ['Slim', 'Regular', 'Relaxed', 'Oversized', 'DropShoulder']
    >;
    gallery: Attribute.Media<'images', true>;
    gender_groups: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::gender-group.gender-group'
    >;
    generated_sku: Attribute.String;
    hs_code: Attribute.String;
    images: Attribute.Media<'images', true>;
    inventory: Attribute.Integer & Attribute.DefaultTo<0>;
    is_archived: Attribute.Boolean & Attribute.DefaultTo<false>;
    is_featured: Attribute.Boolean;
    label_serial_code: Attribute.String & Attribute.Private;
    last_updated_by: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    >;
    materials_lines: Attribute.Component<'product.material-line', true>;
    name: Attribute.String & Attribute.Required;
    product_code: Attribute.String & Attribute.Unique;
    product_variants: Attribute.Component<'variant.product-variant', true>;
    publishedAt: Attribute.DateTime;
    reviews: Attribute.Relation<
      'api::product.product',
      'oneToMany',
      'api::review.review'
    >;
    selling_price: Attribute.Decimal & Attribute.Required;
    seo: Attribute.Component<'common.seo-meta', true>;
    short_description: Attribute.String;
    size_system: Attribute.Enumeration<
      [
        'Alpha (XS-XXL: T-shirts, shirts, pants)',
        'Numeric (single: collar/waist, e.g. 15.5, 32)',
        'Numeric (waist x length: e.g. 32x30)',
        'Shoe size (e.g. 42, 8, UK 9)',
        'Kids age (e.g. 2-3Y, 4-5Y)',
        'Free / one size'
      ]
    > &
      Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Choose how sizes are defined: Alpha (XS-XXL) for T-shirts/shirts/pants; Numeric (single) for collar/waist; Numeric (waist x length) for jeans/trousers; Shoe size; Kids age; or Free / one size.';
        };
      }> &
      Attribute.DefaultTo<'Alpha (XS-XXL: T-shirts, shirts, pants)'>;
    slug: Attribute.UID<'api::product.product', 'name'> & Attribute.Required;
    status: Attribute.Enumeration<['Draft', 'Active', 'Archived']> &
      Attribute.DefaultTo<'Draft'>;
    sub_categories: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::sub-category.sub-category'
    >;
    super_categories: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::super-category.super-category'
    >;
    supplier: Attribute.Component<'supplier.supplier-info'>;
    tag_serial_code: Attribute.String & Attribute.Private;
    tags: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::tag.tag'
    >;
    translations: Attribute.Component<'common.translation', true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    uuid: Attribute.String & Attribute.Unique;
    verifier: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    >;
  };
}

export interface ApiPromobarConfigPromobarConfig extends Schema.SingleType {
  collectionName: 'promobar_configs';
  info: {
    description: '';
    displayName: 'promobar-config';
    pluralName: 'promobar-configs';
    singularName: 'promobar-config';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    animation: Attribute.Enumeration<
      [
        'none',
        'fade',
        'slide',
        'slide-right',
        'slide-up',
        'slide-down',
        'marquee',
        'marquee-right',
        'marquee-up',
        'marquee-down',
        'typewriter',
        'zoom',
        'bounce',
        'flip',
        'highlight',
        'sticky',
        'collapsible',
        'pulse',
        'wave',
        'cycle',
        'manual',
        'auto_dismiss',
        'persistent',
        'hover',
        'framer_motion',
        'gsap',
        'per_message'
      ]
    >;
    background_color: Attribute.String;
    closable: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::promobar-config.promobar-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    dwell_ms: Attribute.Integer;
    enabled: Attribute.Boolean;
    ends_at: Attribute.DateTime;
    gap_ms: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    speed_px_per_sec: Attribute.Integer;
    starts_at: Attribute.DateTime;
    text_color: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::promobar-config.promobar-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPromobarMessagePromobarMessage
  extends Schema.CollectionType {
  collectionName: 'promobar_messages';
  info: {
    displayName: 'promobar-message';
    pluralName: 'promobar-messages';
    singularName: 'promobar-message';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::promobar-message.promobar-message',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    enabled: Attribute.Boolean;
    message: Attribute.String;
    order: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::promobar-message.promobar-message',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiReferralReferral extends Schema.CollectionType {
  collectionName: 'referrals';
  info: {
    displayName: 'referral';
    pluralName: 'referrals';
    singularName: 'referral';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    add_activated_at: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    is_redeemed: Attribute.Boolean;
    publishedAt: Attribute.DateTime;
    referrer: Attribute.Relation<
      'api::referral.referral',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    reffered: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiReviewReview extends Schema.CollectionType {
  collectionName: 'reviews';
  info: {
    description: '';
    displayName: 'review';
    pluralName: 'reviews';
    singularName: 'review';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    approved: Attribute.Boolean;
    approved_by: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'admin::user'
    >;
    archive_date: Attribute.DateTime;
    archive_reason: Attribute.Enumeration<
      ['spam', 'abusive', 'duplicate', 'others']
    >;
    archived_by: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'admin::user'
    >;
    audit_log: Attribute.JSON;
    author_name: Attribute.String;
    comment: Attribute.Blocks;
    content: Attribute.RichText;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    flags: Attribute.Integer;
    helpful_count: Attribute.Integer;
    images: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    is_archived: Attribute.Boolean;
    is_featured: Attribute.Boolean;
    likes: Attribute.BigInteger;
    locale: Attribute.Text;
    product: Attribute.Relation<
      'api::review.review',
      'manyToOne',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    rating: Attribute.Enumeration<
      ['one_star', 'two_star', 'three_star', 'four_star', 'five_star']
    >;
    reply: Attribute.Blocks;
    response: Attribute.Blocks;
    reviewed_at: Attribute.DateTime;
    status: Attribute.Enumeration<['pending', 'approved', 'rejected']>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::review.review',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::review.review',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    verified: Attribute.Boolean;
    videos: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
  };
}

export interface ApiSubCategorySubCategory extends Schema.CollectionType {
  collectionName: 'sub_categories';
  info: {
    description: '';
    displayName: 'sub_category';
    pluralName: 'sub-categories';
    singularName: 'sub-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::sub-category.sub-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::sub-category.sub-category',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::sub-category.sub-category', 'name'>;
    type: Attribute.Enumeration<['cotton', 'muslin', 'katan']>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::sub-category.sub-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSuperCategorySuperCategory extends Schema.CollectionType {
  collectionName: 'super_categories';
  info: {
    description: '';
    displayName: 'super_category';
    pluralName: 'super-categories';
    singularName: 'super-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::super-category.super-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::super-category.super-category',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::super-category.super-category', 'name'>;
    type: Attribute.Enumeration<
      ['living', 'dining', 'shoe', 'jewellery', 'skin and hair']
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::super-category.super-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTagTag extends Schema.CollectionType {
  collectionName: 'tags';
  info: {
    description: '';
    displayName: 'tag';
    pluralName: 'tags';
    singularName: 'tag';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    categories: Attribute.Relation<
      'api::tag.tag',
      'manyToMany',
      'api::category.category'
    >;
    color_code: Attribute.Enumeration<
      [
        'Black',
        'Jet Black',
        'Charcoal Grey',
        'Ash Grey',
        'Cream White',
        'Ivory White',
        'Sand Beige',
        'Stone Beige',
        'Olive Green',
        'Forest Green',
        'Navy Blue',
        'Sky Blue',
        'Dusty Pink',
        'Wine Red',
        'Maroon',
        'White',
        'Yellow',
        'Blue',
        'Deep_Blue',
        'Green',
        'Red'
      ]
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.Blocks;
    is_featured: Attribute.Boolean;
    name: Attribute.String;
    priority: Attribute.Integer;
    products: Attribute.Relation<
      'api::tag.tag',
      'manyToMany',
      'api::product.product'
    >;
    publishedAt: Attribute.DateTime;
    slug: Attribute.UID<'api::tag.tag', 'name'>;
    tag_type: Attribute.Enumeration<
      [
        'organic',
        'cotton',
        'on_sale',
        'out_of_stock',
        'coming_soon',
        'best_seller',
        'trending',
        'hot_pick',
        'linen',
        'modal',
        'bamboo',
        'slim_fit',
        'relaxed_fit',
        'oversized_fit',
        'minimalist',
        'bold',
        'luxury',
        'summer',
        'winter',
        'monsoon',
        'eid_collection',
        'festive',
        'pahela_boishak',
        'launch_week',
        'men',
        'women',
        'kids',
        'unisex',
        'young',
        'gym',
        'casual',
        'formal',
        'loungewear',
        'made_in_Bangladesh',
        'fair_trade',
        'moisture_wicking',
        'anti_odor',
        'stretchable'
      ]
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::tag.tag', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    avatar: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    birth_day: Attribute.Date;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    date_of_birth: Attribute.Date;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    gender: Attribute.Enumeration<
      ['male', 'female', 'not interested to disclose']
    >;
    last_login: Attribute.DateTime;
    marriage_day: Attribute.Date;
    orders: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::order.order'
    >;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    phone_number: Attribute.String & Attribute.Unique;
    provider: Attribute.String;
    referrals: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::referral.referral'
    >;
    resetPasswordToken: Attribute.String & Attribute.Private;
    reviews: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::review.review'
    >;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::audit-log': AdminAuditLog;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'admin::workflow': AdminWorkflow;
      'admin::workflow-stage': AdminWorkflowStage;
      'api::about.about': ApiAboutAbout;
      'api::age-group.age-group': ApiAgeGroupAgeGroup;
      'api::audience-category.audience-category': ApiAudienceCategoryAudienceCategory;
      'api::brand-tier.brand-tier': ApiBrandTierBrandTier;
      'api::category.category': ApiCategoryCategory;
      'api::contact.contact': ApiContactContact;
      'api::events-products-collection.events-products-collection': ApiEventsProductsCollectionEventsProductsCollection;
      'api::factory.factory': ApiFactoryFactory;
      'api::gateway-fee-schedule.gateway-fee-schedule': ApiGatewayFeeScheduleGatewayFeeSchedule;
      'api::gender-group.gender-group': ApiGenderGroupGenderGroup;
      'api::global-setting.global-setting': ApiGlobalSettingGlobalSetting;
      'api::homepage.homepage': ApiHomepageHomepage;
      'api::loyaltypointhistory.loyaltypointhistory': ApiLoyaltypointhistoryLoyaltypointhistory;
      'api::order.order': ApiOrderOrder;
      'api::overhead.overhead': ApiOverheadOverhead;
      'api::policy.policy': ApiPolicyPolicy;
      'api::product-costing-override.product-costing-override': ApiProductCostingOverrideProductCostingOverride;
      'api::product-courier-rate-card.product-courier-rate-card': ApiProductCourierRateCardProductCourierRateCard;
      'api::product.product': ApiProductProduct;
      'api::promobar-config.promobar-config': ApiPromobarConfigPromobarConfig;
      'api::promobar-message.promobar-message': ApiPromobarMessagePromobarMessage;
      'api::referral.referral': ApiReferralReferral;
      'api::review.review': ApiReviewReview;
      'api::sub-category.sub-category': ApiSubCategorySubCategory;
      'api::super-category.super-category': ApiSuperCategorySuperCategory;
      'api::tag.tag': ApiTagTag;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
