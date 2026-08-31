export const MangaInkFilter = () => {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id="manga-ink" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="2.4" intercept="-0.55" />
          <feFuncG type="linear" slope="2.4" intercept="-0.55" />
          <feFuncB type="linear" slope="2.4" intercept="-0.55" />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0 1 1" />
          <feFuncG type="discrete" tableValues="0 0 1 1" />
          <feFuncB type="discrete" tableValues="0 0 1 1" />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncA type="identity" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};
