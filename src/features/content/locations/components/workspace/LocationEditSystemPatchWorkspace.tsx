import type { MutableRefObject, ReactNode } from 'react';

import type { PatchDriver } from '@/features/content/shared/editor/patchDriver';
import type { ValidationError } from '@/features/content/shared/hooks/editRoute.types';
import type { FieldConfig } from '@/ui/patterns/form/form.types';

import type { LocationEditorRailSection } from './rightRail/types';
import { SystemLocationTab } from './rightRail/tabs/location/SystemLocationTab';
import { LocationEditorHeader } from './header/LocationEditorHeader';
import { LocationEditorRailSectionTabs } from './rightRail/LocationEditorRailSectionTabs';
import { LocationEditorRightRail } from './rightRail/LocationEditorRightRail';
import { LocationEditorWorkspace } from './LocationEditorWorkspace';

export type LocationEditSystemPatchWorkspaceProps = {
  locationName: string;
  locationPatched?: boolean;
  ancestryBreadcrumbs: ReactNode;
  saving: boolean;
  dirty: boolean;
  /** Same contract as homebrew edit: block Save when false (e.g. patch validation). */
  saveDisabled?: boolean;
  saveDisabledReason?: string | null;
  errors: ValidationError[];
  success: boolean;
  rightRailOpen: boolean;
  onToggleRightRail: () => void;
  onSave: () => void;
  onBack: () => void;
  fieldConfigs: FieldConfig[];
  patchDriver: PatchDriver;
  validationApiRef: MutableRefObject<{ validateAll: () => boolean } | null>;
  hasExistingPatch: boolean;
  onRemovePatch: () => void;
  railSection: LocationEditorRailSection;
  onRailSectionChange: (section: LocationEditorRailSection) => void;
  mapCanvasColumn: ReactNode;
  selectionPanel: ReactNode;
};

export function LocationEditSystemPatchWorkspace({
  locationName,
  locationPatched,
  ancestryBreadcrumbs,
  saving,
  dirty,
  saveDisabled = false,
  saveDisabledReason = null,
  errors,
  success,
  rightRailOpen,
  onToggleRightRail,
  onSave,
  onBack,
  fieldConfigs,
  patchDriver,
  validationApiRef,
  hasExistingPatch,
  onRemovePatch,
  railSection,
  onRailSectionChange,
  mapCanvasColumn,
  selectionPanel,
}: LocationEditSystemPatchWorkspaceProps) {
  return (
    <LocationEditorWorkspace
      header={
        <LocationEditorHeader
          title={`Patch: ${locationName}`}
          ancestryBreadcrumbs={ancestryBreadcrumbs}
          saving={saving}
          dirty={dirty}
          isNew={false}
          onSave={onSave}
          onBack={onBack}
          errors={errors}
          success={success}
          rightRailOpen={rightRailOpen}
          onToggleRightRail={onToggleRightRail}
          saveDisabled={saveDisabled}
          saveDisabledReason={saveDisabledReason}
        />
      }
      canvas={mapCanvasColumn}
      rightRail={
        <LocationEditorRightRail open={rightRailOpen}>
          <LocationEditorRailSectionTabs
            section={railSection}
            onSectionChange={onRailSectionChange}
            locationPanel={
              <SystemLocationTab
                locationName={locationName}
                locationPatched={locationPatched}
                fieldConfigs={fieldConfigs}
                patchDriver={patchDriver}
                validationApiRef={validationApiRef}
                hasExistingPatch={hasExistingPatch}
                onRemovePatch={onRemovePatch}
                saving={saving}
              />
            }
            selectionPanel={selectionPanel}
          />
        </LocationEditorRightRail>
      }
    />
  );
}
