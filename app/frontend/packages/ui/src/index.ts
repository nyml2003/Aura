/**
 * @aura/ui 内建组件库
 * 依赖 @aura/design-system，使用前请在应用入口 import '@aura/design-system/styles.css'
 */
export {
  StickyLayout,
  StickyStack,
  StickyStackItem,
  StickyHeader,
  StickySection,
  StickyFooter,
  type StickyLayoutProps,
  type StickyStackProps,
  type StickyStackItemProps,
  type StickyHeaderProps,
  type StickySectionProps,
  type StickyFooterProps,
} from "./sticky";
export { ErrorBoundary, type ErrorBoundaryProps } from "./error-boundary";
export {
  createBusinessComponent,
  type CreateBusinessComponentOptions,
} from "./create-business-component";
