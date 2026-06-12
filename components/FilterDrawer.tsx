'use client';

import { Drawer, Tag, Typography, Button, Divider } from 'antd';
import type { BracketFilters, RuntimeLimit } from '@/types';
import styles from './FilterDrawer.module.css';

const { Text } = Typography;
const { CheckableTag } = Tag;

const RUNTIME_OPTIONS: { label: string; value: RuntimeLimit }[] = [
  { label: 'Any', value: null },
  { label: '≤ 90 min', value: 90 },
  { label: '≤ 2 hrs', value: 120 },
  { label: '≤ 2.5 hrs', value: 150 },
  { label: '≤ 3 hrs', value: 180 },
];

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  availableGenres: string[];
  availableDecades: number[];
  availableServices: string[];
  filters: BracketFilters;
  onChange: (filters: BracketFilters) => void;
  matchCount: number;
  accentColor: string;
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function FilterDrawer({
  open,
  onClose,
  availableGenres,
  availableDecades,
  availableServices,
  filters,
  onChange,
  matchCount,
  accentColor,
}: FilterDrawerProps) {
  return (
    <Drawer
      title={
        <Text className={styles.drawerTitle}>Filter Movies</Text>
      }
      placement='right'
      open={open}
      onClose={onClose}
      styles={{
        wrapper: { width: 360 },
        body: {
          background: '#FDFBD4',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        },
        header: { background: '#FDFBD4', borderBottom: '1px solid #d4cfa0' },
        footer: {
          background: '#FDFBD4',
          borderTop: '1px solid #d4cfa0',
          padding: '16px 20px',
        },
      }}
      footer={
        <Button
          onClick={onClose}
          className={styles.applyBtn}
          style={{ '--accent': accentColor } as React.CSSProperties}
        >
          Show {matchCount} movie{matchCount !== 1 ? 's' : ''}
        </Button>
      }
    >
      {availableGenres.length > 0 && (
        <>
          <Text className={styles.sectionLabel}>Genre</Text>
          <div className={styles.tagGroup}>
            {availableGenres.map((g) => {
              const active = filters.genres.includes(g);
              return (
                <CheckableTag
                  key={g}
                  checked={active}
                  onChange={() =>
                    onChange({ ...filters, genres: toggle(filters.genres, g) })
                  }
                  className={
                    active ? `${styles.tag} ${styles.tagActive}` : styles.tag
                  }
                  style={
                    active
                      ? ({ '--accent': accentColor } as React.CSSProperties)
                      : undefined
                  }
                >
                  {g}
                </CheckableTag>
              );
            })}
          </div>
          <Divider className={styles.divider} />
        </>
      )}

      {availableDecades.length > 0 && (
        <>
          <Text className={styles.sectionLabel}>Decade</Text>
          <div className={styles.tagGroup}>
            {availableDecades.map((d) => {
              const active = filters.decades.includes(d);
              return (
                <CheckableTag
                  key={d}
                  checked={active}
                  onChange={() =>
                    onChange({
                      ...filters,
                      decades: toggle(filters.decades, d),
                    })
                  }
                  className={
                    active ? `${styles.tag} ${styles.tagActive}` : styles.tag
                  }
                  style={
                    active
                      ? ({ '--accent': accentColor } as React.CSSProperties)
                      : undefined
                  }
                >
                  {d}s
                </CheckableTag>
              );
            })}
          </div>
          <Divider className={styles.divider} />
        </>
      )}

      <Text className={styles.sectionLabel}>Max Runtime</Text>
      <div className={styles.tagGroup}>
        {RUNTIME_OPTIONS.map(({ label, value }) => {
          const active = filters.maxRuntime === value;
          return (
            <CheckableTag
              key={label}
              checked={active}
              onChange={() => onChange({ ...filters, maxRuntime: value })}
              className={
                active ? `${styles.tag} ${styles.tagActive}` : styles.tag
              }
              style={
                active
                  ? ({ '--accent': accentColor } as React.CSSProperties)
                  : undefined
              }
            >
              {label}
            </CheckableTag>
          );
        })}
      </div>

      {availableServices.length > 0 && (
        <>
          <Divider className={styles.divider} />
          <Text className={styles.sectionLabel}>Streaming Service</Text>
          <div className={styles.tagGroup}>
            {availableServices.map((s) => {
              const active = filters.streamingServices.includes(s);
              return (
                <CheckableTag
                  key={s}
                  checked={active}
                  onChange={() =>
                    onChange({
                      ...filters,
                      streamingServices: toggle(filters.streamingServices, s),
                    })
                  }
                  className={
                    active ? `${styles.tag} ${styles.tagActive}` : styles.tag
                  }
                  style={
                    active
                      ? ({ '--accent': accentColor } as React.CSSProperties)
                      : undefined
                  }
                >
                  {s}
                </CheckableTag>
              );
            })}
          </div>
        </>
      )}
    </Drawer>
  );
}
