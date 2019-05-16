/* tslint:disable */

import * as React from 'react'
import '../styles/c1.scss'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'

const C1 = () => {
  return (
    <Layout>
      <SEO title="Chart-1" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Chart 1</h1>
      <div id="container">
        <div className="svg" />
        <div id="tag" />
      </div>
    </Layout>
  )
}

export default C1
