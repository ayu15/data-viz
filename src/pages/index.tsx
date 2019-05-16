import * as React from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'
import { Link } from 'gatsby'

const IndexPage = () => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <h1>Hello</h1>
    <p>Welcome to my data visualization collection.</p>
    <Link to="/c2">Chart 2</Link>
  </Layout>
)

export default IndexPage
