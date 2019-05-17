import * as React from 'react'

const Boxman = () => (
  <svg style={{ border: '1px solid #aaa', width: 400, height: 400 }}>
    <circle cx="100" cy="150" r="30" fill="#441d92" />
    <circle cx="290" cy="150" r="30" fill="#441d92" />

    <rect width="190" height="190" x="100" y="90" fill="#583ead" />

    <circle cx="230" cy="150" r="16" fill="#c3e2c3" />
    <circle cx="150" cy="150" r="16" fill="#c3e2c3" />

    <line x1="150" y1="230" x2="230" y2="230" stroke="white" />

    <text x="160" y="320" fontSize="20">boxman</text>
  </svg>
)

export default Boxman