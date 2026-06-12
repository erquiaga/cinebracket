'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  FilterOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import FilterDrawer from '@/components/FilterDrawer';
import {
  applyFilters,
  createBracket,
  DEFAULT_FILTERS,
} from '@/lib/bracketEngine';
import type { BracketFilters, Movie } from '@/types';
import styles from './FilterView.module.css';

const { Title, Text } = Typography;

interface FilterViewProps {
  accentColor: string;
  backHref: string;
  bracketHref: string;
}

export default function FilterView({
  accentColor,
  backHref,
  bracketHref,
}: FilterViewProps) {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filters, setFilters] = useState<BracketFilters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('cinebracket_movies');
    if (!raw) {
      router.replace(backHref);
      return;
    }
    setMovies(JSON.parse(raw));
  }, [router, backHref]);

  const availableGenres = useMemo(
    () => [...new Set(movies.flatMap((m) => m.genres ?? []))].sort(),
    [movies],
  );
  const availableDecades = useMemo(
    () => [...new Set(movies.map((m) => Math.floor(m.year / 10) * 10))].sort(),
    [movies],
  );
  const availableServices = useMemo(
    () =>
      [...new Set(movies.flatMap((m) => m.streamingProviders ?? []))].sort(),
    [movies],
  );
  const filtered = useMemo(
    () => applyFilters(movies, filters),
    [movies, filters],
  );

  const activeFilterCount =
    filters.genres.length +
    filters.decades.length +
    filters.streamingServices.length +
    (filters.maxRuntime !== null ? 1 : 0);

  function startBracket() {
    sessionStorage.setItem(
      'cinebracket_bracket_state',
      JSON.stringify(createBracket(filtered)),
    );
    router.push(bracketHref);
  }

  const canStart = filtered.length >= 2;

  return (
    <main className={styles.page} style={{ '--accent': accentColor } as React.CSSProperties}>
      <div className={styles.header}>
        <div className={styles.navRow}>
          <Button
            type='text'
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(backHref)}
            className={styles.navBtn}
          >
            Back
          </Button>
          <Button
            type='text'
            icon={<HomeOutlined />}
            onClick={() => router.push('/')}
            className={styles.navBtn}
          >
            Home
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' as const }}
        >
          <Title
            level={2}
            className={styles.title}
            style={{
              fontFamily: 'var(--font-folio), sans-serif',
              fontWeight: 'normal',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '0.04em',
              marginBottom: 8,
            }}
          >
            <span className={styles.accentSpan}>Filter</span>
          </Title>
          <Text className={styles.subtitle}>
            Narrow down your list before the bracket starts.
          </Text>
        </motion.div>
      </div>

      <motion.div
        className={styles.filterArea}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
      >
        <div className={styles.filterBar}>
          <div className={styles.filterBarLeft}>
            <Text className={styles.filterLabel}>
              {activeFilterCount === 0
                ? 'No filters applied'
                : `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active`}
            </Text>
            <Text className={styles.filterCount}>
              {filtered.length} of {movies.length} movies match
            </Text>
          </div>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawerOpen(true)}
            className={styles.adjustBtn}
          >
            Adjust
          </Button>
        </div>

        {activeFilterCount > 0 && (
          <div className={styles.activeTags}>
            {filters.genres.map((g) => (
              <Tag
                key={g}
                closable
                onClose={() =>
                  setFilters((f) => ({
                    ...f,
                    genres: f.genres.filter((x) => x !== g),
                  }))
                }
                className={styles.activeTag}
              >
                {g}
              </Tag>
            ))}
            {filters.decades.map((d) => (
              <Tag
                key={d}
                closable
                onClose={() =>
                  setFilters((f) => ({
                    ...f,
                    decades: f.decades.filter((x) => x !== d),
                  }))
                }
                className={styles.activeTag}
              >
                {d}s
              </Tag>
            ))}
            {filters.maxRuntime && (
              <Tag
                closable
                onClose={() => setFilters((f) => ({ ...f, maxRuntime: null }))}
                className={styles.activeTag}
              >
                ≤ {filters.maxRuntime} min
              </Tag>
            )}
            {filters.streamingServices.map((s) => (
              <Tag
                key={s}
                closable
                onClose={() =>
                  setFilters((f) => ({
                    ...f,
                    streamingServices: f.streamingServices.filter(
                      (x) => x !== s,
                    ),
                  }))
                }
                className={styles.activeTag}
              >
                {s}
              </Tag>
            ))}
            <Tag
              className={styles.clearTag}
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear all
            </Tag>
          </div>
        )}

        {filtered.length < 2 && movies.length > 0 && (
          <Text className={styles.filterError}>
            At least 2 movies are needed to run a bracket. Loosen your filters.
          </Text>
        )}
      </motion.div>

      <motion.div
        className={styles.ctaArea}
        initial={{ opacity: 0 }}
        animate={{ opacity: canStart ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          disabled={!canStart}
          onClick={startBracket}
          className={`${styles.ctaBtn} ${canStart ? styles.ctaBtnActive : styles.ctaBtnInactive}`}
        >
          {canStart
            ? `Start Bracket with ${filtered.length} movies →`
            : 'Not enough movies'}
        </Button>
      </motion.div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        availableGenres={availableGenres}
        availableDecades={availableDecades}
        availableServices={availableServices}
        filters={filters}
        onChange={setFilters}
        matchCount={filtered.length}
        accentColor={accentColor}
      />
    </main>
  );
}
