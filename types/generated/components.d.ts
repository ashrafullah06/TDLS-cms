import type { Attribute, Schema } from '@strapi/strapi';

export interface CommonAltName extends Schema.Component {
  collectionName: 'components_common_alt_names';
  info: {
    displayName: 'Alt Name';
  };
  attributes: {
    is_primary: Attribute.Boolean & Attribute.DefaultTo<false>;
    lang: Attribute.Enumeration<['en', 'bn']> & Attribute.DefaultTo<'en'>;
    usage: Attribute.Enumeration<
      ['default', 'marketplace', 'nickname', 'search']
    > &
      Attribute.DefaultTo<'default'>;
    value: Attribute.String & Attribute.Required;
  };
}

export interface CommonKeyword extends Schema.Component {
  collectionName: 'components_common_keywords';
  info: {
    displayName: 'Keyword';
  };
  attributes: {
    is_primary: Attribute.Boolean & Attribute.DefaultTo<false>;
    lang: Attribute.Enumeration<['en', 'bn']> & Attribute.DefaultTo<'en'>;
    usage: Attribute.Enumeration<['seo', 'search', 'tag']> &
      Attribute.DefaultTo<'seo'>;
    value: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 48;
      }>;
  };
}

export interface CommonMaterialLine extends Schema.Component {
  collectionName: 'components_product_material_lines';
  info: {
    displayName: 'Material Line';
  };
  attributes: {
    material: Attribute.Enumeration<
      [
        'Cotton',
        'Linen',
        'Modal',
        'Bamboo',
        'Polyester',
        'Nylon',
        'Elastane',
        'Wool',
        'Silk',
        'Other'
      ]
    > &
      Attribute.Required;
    percent: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
  };
}

export interface CommonSeoMeta extends Schema.Component {
  collectionName: 'components_common_seo_meta';
  info: {
    displayName: 'SEO Meta';
  };
  attributes: {
    channel: Attribute.Enumeration<['website', 'marketplace', 'social']> &
      Attribute.DefaultTo<'website'>;
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    keywords: Attribute.Component<'common.keyword', true>;
    lang: Attribute.Enumeration<['en', 'bn']> & Attribute.DefaultTo<'en'>;
    title: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

export interface CommonTranslation extends Schema.Component {
  collectionName: 'components_common_translations';
  info: {
    description: 'Localized product information';
    displayName: 'Translation';
  };
  attributes: {
    description: Attribute.Text;
    locale: Attribute.Enumeration<['en', 'bn']> &
      Attribute.Required &
      Attribute.DefaultTo<'en'>;
    name: Attribute.String;
    short_description: Attribute.String;
  };
}

export interface ContactSocialLinks extends Schema.Component {
  collectionName: 'components_contact_social_links';
  info: {
    displayName: 'social_links';
  };
  attributes: {
    links: Attribute.String;
    platform: Attribute.Enumeration<
      ['Facebook', 'Youtube', 'Google', 'Pinterest', 'Instagram', 'TikTok']
    >;
  };
}

export interface OrderComponentsAddressSnapshot extends Schema.Component {
  collectionName: 'components_order_components_address_snapshots';
  info: {
    description: '';
    displayName: 'address_snapshot';
  };
  attributes: {
    address_line1: Attribute.String & Attribute.Required;
    address_line2_Union: Attribute.String & Attribute.Required;
    country: Attribute.String & Attribute.Required;
    district: Attribute.String & Attribute.Required;
    division: Attribute.String & Attribute.Required;
    full_name: Attribute.String & Attribute.Required;
    note: Attribute.Blocks;
    phone_number: Attribute.String & Attribute.Required;
    Police_station_town_upazila: Attribute.String & Attribute.Required;
    postal_code: Attribute.String;
  };
}

export interface OrderComponentsProductItems extends Schema.Component {
  collectionName: 'components_order_components_product_items';
  info: {
    description: '';
    displayName: 'product_items';
  };
  attributes: {
    product_name_snapshot: Attribute.String;
    product_price_snapshot: Attribute.Decimal;
    product_ref: Attribute.Relation<
      'order-components.product-items',
      'oneToOne',
      'api::product.product'
    >;
    quantity: Attribute.Integer;
    selected_color: Attribute.String;
    selected_size: Attribute.String;
    subtotal_price: Attribute.Decimal;
  };
}

export interface ProductDetailsProductIdentity extends Schema.Component {
  collectionName: 'components_product_details_product_identities';
  info: {
    description: '';
    displayName: 'product_identity';
  };
  attributes: {
    arch_ref: Attribute.String;
    creator: Attribute.Relation<
      'product-details.product-identity',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    factory_batch_code: Attribute.String;
    internal_notes: Attribute.Blocks;
    label_serial_code: Attribute.String;
    tag_serial_code: Attribute.String;
    verification_status: Attribute.Enumeration<
      ['pending', 'verified', 'rejected']
    >;
    verified_at: Attribute.DateTime;
    verifier: Attribute.Relation<
      'product-details.product-identity',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ProductMaterialLine extends Schema.Component {
  collectionName: 'components_product_material_lines_v2';
  info: {
    description: 'Material line item for Product';
    displayName: 'material-line';
  };
  attributes: {};
}

export interface SectionsHeroSlides1 extends Schema.Component {
  collectionName: 'components_sections_hero_slides_1s';
  info: {
    description: '';
    displayName: 'hero_slides';
  };
  attributes: {
    background_image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    cta_link: Attribute.String;
    cta_text: Attribute.String;
    mobile_image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    overlay_color: Attribute.String;
    overlay_opacity: Attribute.Decimal;
    subtitle: Attribute.String;
    title: Attribute.String;
    video: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface SupplierSupplierInfo extends Schema.Component {
  collectionName: 'components_supplier_supplier_infos';
  info: {
    description: 'Supplier details for product sourcing';
    displayName: 'Supplier Info';
  };
  attributes: {
    contact_email: Attribute.Email;
    contact_phone: Attribute.String;
    name: Attribute.String & Attribute.Required;
    notes: Attribute.Text;
  };
}

export interface VariantProductVariant extends Schema.Component {
  collectionName: 'components_variant_product_variants';
  info: {
    description: 'Variants for a product (color + size matrix)';
    displayName: 'Product Variant';
  };
  attributes: {
    barcode: Attribute.String;
    color: Attribute.String & Attribute.Required;
    color_code: Attribute.String;
    color_key: Attribute.String;
    generated_sku: Attribute.String;
    size: Attribute.String;
    size_stocks: Attribute.Component<'variant.size-stock', true>;
    variant_image: Attribute.Media<'images', true>;
  };
}

export interface VariantSizeStock extends Schema.Component {
  collectionName: 'components_variant_size_stocks';
  info: {
    description: 'Concrete inventory & pricing for a single size within a color variant';
    displayName: 'Size Stock';
  };
  attributes: {
    backorder_allowed: Attribute.Boolean & Attribute.DefaultTo<false>;
    barcode: Attribute.String;
    compare_at_price: Attribute.Integer;
    generated_sku: Attribute.String;
    inventory_status: Attribute.Enumeration<
      ['in stock', 'low stock', 'restock due']
    >;
    is_active: Attribute.Boolean & Attribute.DefaultTo<true>;
    price: Attribute.Integer;
    price_override: Attribute.Integer;
    primary_value: Attribute.Decimal &
      Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    reorder_level: Attribute.Integer;
    restock_date: Attribute.DateTime;
    secondary_value: Attribute.Decimal &
      Attribute.SetPluginOptions<{
        'content-manager': {
          visible: false;
        };
      }>;
    size_name: Attribute.Enumeration<
      ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'ONE']
    > &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Label printed on the garment tag (e.g. XS, S, M, L, XL, ONE). For numeric systems (collar, waist x length, shoe, kids) you still enter the label used on the tag.';
        };
      }>;
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
          visible: false;
        };
      }>;
    sold_count: Attribute.Integer & Attribute.DefaultTo<0>;
    stock_quantity: Attribute.Integer & Attribute.DefaultTo<0>;
    warehouse_location: Attribute.Enumeration<
      ['Dhaka', 'Khulna', 'Sylhet', 'Chittagong']
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'common.alt-name': CommonAltName;
      'common.keyword': CommonKeyword;
      'common.material-line': CommonMaterialLine;
      'common.seo-meta': CommonSeoMeta;
      'common.translation': CommonTranslation;
      'contact.social-links': ContactSocialLinks;
      'order-components.address-snapshot': OrderComponentsAddressSnapshot;
      'order-components.product-items': OrderComponentsProductItems;
      'product-details.product-identity': ProductDetailsProductIdentity;
      'product.material-line': ProductMaterialLine;
      'sections.hero-slides-1': SectionsHeroSlides1;
      'supplier.supplier-info': SupplierSupplierInfo;
      'variant.product-variant': VariantProductVariant;
      'variant.size-stock': VariantSizeStock;
    }
  }
}
