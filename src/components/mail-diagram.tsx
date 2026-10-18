export function MailDiagram() {
  return (
    <div className="mail-diagram">
      <div className="diagram-overline">
        <span>
          <i /> ALL SYSTEMS. ONE BINARY.
        </span>
        <span>FIG. 001</span>
      </div>
      <svg viewBox="0 0 700 530" role="img" aria-labelledby="diagram-title diagram-desc">
        <title id="diagram-title">Your complete mail stack, in one executable</title>
        <desc id="diagram-desc">
          SMTP brings messages to the Go mail engine, with spam checks, a delivery queue and local
          Maildir storage. IMAP and the web interfaces connect you to your mail.
        </desc>
        <defs>
          <pattern
            id="diagram-grid"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
            patternTransform="matrix(1 .48 -1 .48 350 30)"
          >
            <path d="M36 0H0V36" fill="none" stroke="var(--diagram-grid)" strokeWidth="1" />
          </pattern>
          <linearGradient id="server-top" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--cyan-light)" />
            <stop offset="1" stopColor="var(--cyan)" />
          </linearGradient>
          <linearGradient id="server-side" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#13b2c5" />
            <stop offset="1" stopColor="#087c92" />
          </linearGradient>
          <linearGradient id="platform" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--platform-top)" />
            <stop offset="1" stopColor="var(--platform-bottom)" />
          </linearGradient>
          <filter id="server-shadow" x="-50%" y="-40%" width="200%" height="220%">
            <feDropShadow
              dx="0"
              dy="22"
              stdDeviation="18"
              floodColor="#008a9c"
              floodOpacity=".13"
            />
          </filter>
        </defs>
        <rect x="0" y="10" width="700" height="510" fill="url(#diagram-grid)" opacity=".7" />
        <g className="diagram-lines" fill="none" stroke="var(--diagram-line)" strokeWidth="1.5">
          <path d="M170 166v66l103 51" />
          <path d="M527 155v65l-91 46" />
          <path d="m194 363 68-34" />
          <path d="m449 326 83 41v47" />
        </g>
        <g className="mail-packets" fill="var(--cyan)">
          <circle r="3">
            <animateMotion dur="6s" repeatCount="indefinite" path="M170 166v66l103 51" />
          </circle>
          <circle r="3">
            <animateMotion dur="7s" repeatCount="indefinite" path="M436 266l91-46v-65" />
          </circle>
          <circle r="3">
            <animateMotion dur="8s" repeatCount="indefinite" path="M449 326l83 41v47" />
          </circle>
        </g>
        <g filter="url(#server-shadow)">
          <path
            d="m211 344 141-72 146 73v25l-146 75-141-74Z"
            fill="var(--platform-side)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m211 344 141-72 146 73-146 75Z"
            fill="url(#platform)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m231 344 121-62 126 63-126 64Z"
            fill="none"
            stroke="var(--diagram-line)"
            opacity=".5"
          />
          <path d="m263 212 89-46 91 46v113l-91 46-89-46Z" fill="url(#server-side)" />
          <path d="m352 257 91-45v113l-91 46Z" fill="#087d94" opacity=".75" />
          <path d="m263 212 89-46 91 46-91 45Z" fill="url(#server-top)" stroke="#66dce8" />
          <g fill="none" stroke="#90e9f0" opacity=".6">
            <path d="m263 249 89 45 91-45M263 286l89 45 91-45" />
            <path d="M352 257v114" opacity=".4" />
          </g>
          <g
            transform="translate(326 193) matrix(1 .5 -1 .5 0 0)"
            stroke="#064e62"
            strokeWidth="3"
            fill="none"
            strokeLinejoin="round"
          >
            <rect width="53" height="34" rx="3" />
            <path d="m0 2 26 19L53 2M0 33l17-16m36 16L36 17" />
          </g>
          <g stroke="#b4f6f7" strokeWidth="3" strokeLinecap="round">
            <path d="m278 244 22 11m-22 26 22 11m-22 26 22 11" />
          </g>
          <g fill="#91f3d7">
            <circle cx="421" cy="248" r="3" />
            <circle cx="421" cy="285" r="3" />
            <circle cx="421" cy="322" r="3" />
          </g>
          <text x="369" y="306" transform="rotate(-27 369 306)" className="svg-server-label">
            uMailServer
          </text>
        </g>
        <g className="diagram-node">
          <path
            d="m111 126 58-29 60 30v38l-60 30-58-30Z"
            fill="var(--node-side)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m111 126 58-29 60 30-60 30Z"
            fill="var(--node-top)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m147 118 23-11 25 12-24 12-24-13Zm0 0 24 2 24-1"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2"
          />
          <text x="170" y="220" textAnchor="middle">
            SMTP IN / OUT
          </text>
        </g>
        <g className="diagram-node">
          <path
            d="m470 109 57-29 58 29v38l-58 30-57-29Z"
            fill="var(--node-side)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m470 109 57-29 58 29-58 30Z"
            fill="var(--node-top)"
            stroke="var(--diagram-line)"
          />
          <g fill="none" stroke="var(--cyan)" strokeWidth="2">
            <path d="m511 102 15-8 17 8-17 9-15-9Zm0 6 15 9 17-9m-32 6 15 9 17-9" />
          </g>
          <text x="527" y="202" textAnchor="middle">
            MAILDIR++
          </text>
        </g>
        <g className="diagram-node">
          <path
            d="m115 349 42-21 43 21v28l-43 22-42-21Z"
            fill="var(--node-side)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m115 349 42-21 43 21-43 22Z"
            fill="var(--node-top)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m143 347 14-7 15 7-15 8-14-8Z"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2"
          />
          <text x="157" y="426" textAnchor="middle">
            IMAP / POP3
          </text>
        </g>
        <g className="diagram-node">
          <path
            d="m489 414 44-22 44 22v28l-44 23-44-23Z"
            fill="var(--node-side)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m489 414 44-22 44 22-44 23Z"
            fill="var(--node-top)"
            stroke="var(--diagram-line)"
          />
          <g stroke="var(--cyan)" strokeWidth="2" fill="none">
            <path d="m519 410-7 4 7 4m28-8 7 4-7 4m-11-12-6 16" />
          </g>
          <text x="533" y="492" textAnchor="middle">
            WEB / REST / MCP
          </text>
        </g>
        <g transform="translate(62 273)">
          <rect width="142" height="29" rx="14.5" fill="var(--bg)" stroke="var(--diagram-line)" />
          <circle cx="17" cy="14.5" r="3" fill="var(--cyan)" />
          <text x="29" y="18" className="svg-pill">
            PURE GO. ALL YOURS.
          </text>
        </g>
      </svg>
      <div className="diagram-caption">
        <span>A smaller stack. A clearer picture.</span>
        <span>GO →</span>
      </div>
    </div>
  );
}

export function Pipeline() {
  const nodes = [
    ['01', 'Receive', 'SMTP · port 25', 'M10 17h24v18H10zM10 18l12 9 12-9'],
    [
      '02',
      'Check',
      'SPF · DKIM · DMARC',
      'M22 9 36 14v10c0 9-14 16-14 16S8 33 8 24V14L22 9Zm-7 14 5 5 9-10',
    ],
    ['03', 'Route', 'Sieve · local delivery', 'M9 14h24M27 8l6 6-6 6M35 33H11m6-6-6 6 6 6'],
    [
      '04',
      'Store',
      'Maildir++ · bbolt',
      'M9 16l13-7 13 7v20l-13 7-13-7V16Zm0 0 13 7 13-7m-13 7v20',
    ],
    [
      '05',
      'Connect',
      'IMAP · webmail · API',
      'M7 11h30v25H7zM7 17h30M12 14h1m4 0h1M16 23l-5 4 5 4m12-8 5 4-5 4',
    ],
  ];
  return (
    <div className="pipeline">
      {nodes.map(([num, title, sub, path], i) => (
        <div className="pipeline-step" key={num}>
          <div className="pipeline-visual">
            <span>{num}</span>
            <svg
              viewBox="0 0 44 48"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d={path} />
            </svg>
            {i < 4 && (
              <div className="pipeline-wire">
                <i />
              </div>
            )}
          </div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
      ))}
    </div>
  );
}
