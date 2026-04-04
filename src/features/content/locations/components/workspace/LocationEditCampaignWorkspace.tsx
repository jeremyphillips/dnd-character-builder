import {
  LocationEditHomebrewWorkspace,
  type LocationEditHomebrewWorkspaceProps,
} from './LocationEditHomebrewWorkspace';

/**
 * @deprecated Use {@link LocationEditHomebrewWorkspace} with `onHomebrewSubmit`. Same UI; name reflects user-authored editing, not the active campaign context.
 */
export type LocationEditCampaignWorkspaceProps = Omit<
  LocationEditHomebrewWorkspaceProps,
  'onHomebrewSubmit'
> & {
  onCampaignSubmit: LocationEditHomebrewWorkspaceProps['onHomebrewSubmit'];
};

/**
 * @deprecated Use {@link LocationEditHomebrewWorkspace}.
 */
export function LocationEditCampaignWorkspace({
  onCampaignSubmit,
  ...rest
}: LocationEditCampaignWorkspaceProps) {
  return <LocationEditHomebrewWorkspace {...rest} onHomebrewSubmit={onCampaignSubmit} />;
}
