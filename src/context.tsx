import * as React from "react";

import { ExtendedRecordMap } from "notion-types";

import { AssetWrapper } from "./components/asset-wrapper";
import { Checkbox as DefaultCheckbox } from "./components/checkbox";
import { Header } from "./components/header";
import { wrapNextImage, wrapNextLink } from "./next";
import { MapImageUrlFn, MapPageUrlFn, NotionComponents, SearchNotionFn } from "./types/types";
import { defaultMapImageUrl, defaultMapPageUrl } from "./utils";

export interface NotionContext {
  recordMap: ExtendedRecordMap;
  components: NotionComponents;

  mapPageUrl: MapPageUrlFn;
  mapImageUrl: MapImageUrlFn;
  searchNotion?: SearchNotionFn;
  isShowingSearch?: boolean;
  onHideSearch?: () => void;

  rootPageId?: string;
  rootDomain?: string;

  fullPage: boolean;
  darkMode: boolean;
  previewImages: boolean;
  forceCustomImages: boolean;
  showCollectionViewDropdown: boolean;
  showTableOfContents: boolean;
  minTableOfContentsItems: number;
  linkTableTitleProperties: boolean;
  isLinkCollectionToUrlProperty: boolean;

  defaultPageIcon?: string;
  defaultPageCover?: string;
  defaultPageCoverPosition?: number;

  zoom: any;

  pageAsideTop?: React.ReactNode;
  pageAsideBottom?: React.ReactNode;
}

export interface PartialNotionContext {
  recordMap?: ExtendedRecordMap;
  components?: Partial<NotionComponents>;

  mapPageUrl?: MapPageUrlFn;
  mapImageUrl?: MapImageUrlFn;
  searchNotion?: SearchNotionFn;
  isShowingSearch?: boolean;
  onHideSearch?: () => void;

  rootPageId?: string;
  rootDomain?: string;

  fullPage?: boolean;
  darkMode?: boolean;
  previewImages?: boolean;
  forceCustomImages?: boolean;
  showCollectionViewDropdown?: boolean;
  linkTableTitleProperties?: boolean;
  isLinkCollectionToUrlProperty?: boolean;

  showTableOfContents?: boolean;
  minTableOfContentsItems?: number;

  defaultPageIcon?: string;
  defaultPageCover?: string;
  defaultPageCoverPosition?: number;

  zoom?: any;

  children?: React.ReactNode;
}

const DefaultLink: React.FC = (props) => <a target="_blank" rel="noopener noreferrer" {...props} />;
const DefaultLinkMemo = React.memo(DefaultLink);
const DefaultPageLink: React.FC = (props) => <a {...props} />;
const DefaultPageLinkMemo = React.memo(DefaultPageLink);

const DefaultEmbed: React.FC<any> = (props) => <AssetWrapper {...props} />;
const DefaultHeader = Header;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const dummyLink = ({
  href,
  rel,
  target,
  title,
  ...rest
}: {
  href?: string;
  rel?: string;
  target?: string;
  title?: string;
  [key: string]: any;
}) => <span {...rest} />;

const dummyComponent = (name: string) => () => {
  console.warn(
    `Warning: using empty component "${name}" (you should override this in NotionRenderer.components)`
  );

  return null;
};

// TODO: should we use React.memo here?
// https://reactjs.org/docs/react-api.html#reactmemo
const dummyOverrideFn = (_: any, defaultValueFn: () => React.ReactNode) => defaultValueFn();

const defaultComponents: NotionComponents = {
  Image: null as unknown as React.FC<{
    src: string;
    alt?: string;
    className?: string;
  }>,
  Link: DefaultLinkMemo,
  PageLink: DefaultPageLinkMemo,
  Checkbox: DefaultCheckbox as React.FC<{
    isChecked: boolean;
    blockId: string;
  }>,
  Callout: undefined, // use the built-in callout rendering by default

  Code: dummyComponent("Code"),
  Equation: dummyComponent("Equation"),

  Collection: dummyComponent("Collection"),
  Property: undefined, // use the built-in property rendering by default

  propertyTextValue: dummyOverrideFn,
  propertySelectValue: dummyOverrideFn,
  propertyRelationValue: dummyOverrideFn,
  propertyFormulaValue: dummyOverrideFn,
  propertyTitleValue: dummyOverrideFn,
  propertyPersonValue: dummyOverrideFn,
  propertyFileValue: dummyOverrideFn,
  propertyCheckboxValue: dummyOverrideFn,
  propertyUrlValue: dummyOverrideFn,
  propertyEmailValue: dummyOverrideFn,
  propertyPhoneNumberValue: dummyOverrideFn,
  propertyNumberValue: dummyOverrideFn,
  propertyLastEditedTimeValue: dummyOverrideFn,
  propertyCreatedTimeValue: dummyOverrideFn,
  propertyDateValue: dummyOverrideFn,

  Pdf: dummyComponent("Pdf"),
  Tweet: dummyComponent("Tweet"),
  Modal: dummyComponent("Modal"),

  Header: DefaultHeader,
  Embed: DefaultEmbed,
};

const defaultNotionContext: NotionContext = {
  recordMap: {
    block: {},
    collection: {},
    collection_view: {},
    collection_query: {},
    notion_user: {},
    signed_urls: {},
  },

  components: defaultComponents,

  mapPageUrl: defaultMapPageUrl(),
  mapImageUrl: defaultMapImageUrl,
  searchNotion: undefined,
  isShowingSearch: false,
  onHideSearch: undefined,

  fullPage: false,
  darkMode: false,
  previewImages: false,
  forceCustomImages: false,
  showCollectionViewDropdown: true,
  linkTableTitleProperties: true,
  isLinkCollectionToUrlProperty: false,

  showTableOfContents: false,
  minTableOfContentsItems: 3,

  defaultPageIcon: undefined,
  defaultPageCover: undefined,
  defaultPageCoverPosition: 0.5,

  zoom: null,

  pageAsideTop: null,
  pageAsideBottom: null,
};

const ctx = React.createContext<NotionContext>(defaultNotionContext);

export const NotionContextProvider: React.FC<PartialNotionContext> = ({
  components: themeComponents = {},
  children,
  mapPageUrl,
  mapImageUrl,
  rootPageId,
  ...rest
}) => {
  const typedRest = rest as Record<string, unknown>;
  for (const key of Object.keys(typedRest)) {
    if (typedRest[key] === undefined) {
      delete typedRest[key];
    }
  }

  const wrappedThemeComponents = React.useMemo(
    () => ({
      ...themeComponents,
    }),
    [themeComponents]
  );

  if (wrappedThemeComponents.nextImage) {
    wrappedThemeComponents.Image = wrapNextImage(themeComponents.nextImage);
  }

  if (wrappedThemeComponents.nextLink) {
    wrappedThemeComponents.nextLink = wrapNextLink(themeComponents.nextLink);
  }

  const typedWrappedComponents = wrappedThemeComponents as Record<string, unknown>;
  for (const key of Object.keys(typedWrappedComponents)) {
    if (!typedWrappedComponents[key]) {
      delete typedWrappedComponents[key];
    }
  }

  const value = React.useMemo(
    () => ({
      ...defaultNotionContext,
      ...rest,
      rootPageId,
      mapPageUrl: mapPageUrl ?? defaultMapPageUrl(rootPageId),
      mapImageUrl: mapImageUrl ?? defaultMapImageUrl,
      components: { ...defaultComponents, ...wrappedThemeComponents },
    }),
    [mapImageUrl, mapPageUrl, wrappedThemeComponents, rootPageId, rest]
  );

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
};

export const NotionContextConsumer = ctx.Consumer;

export const useNotionContext = (): NotionContext => {
  return React.useContext(ctx);
};
