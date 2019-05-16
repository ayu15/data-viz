/* tslint:disable */

import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'

const C2 = () => {
  React.useEffect(() => renderMyChart())
  const renderMyChart = () => {
    const data = [3, 5, 8, 7, 2, 9, 2, 10, 4, 9, 3]
    const height = 500
    const width = 200
    const barWidth = width / data.length
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, height])
    const svg = d3
      .select('#c2')
      .style('text-align', 'center')
      .append('svg')
      .style('border', '1px solid black')
      .attr('width', 200)
      .attr('height', height)
    const bars = svg
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('height', d => yScale(d))
      .attr('width', barWidth)
      .attr('x', (d, i) => i * barWidth)
      .attr('y', d => height - yScale(d))
      .attr('stroke', 'white')
      .attr('fill', 'steelblue')
  }
  return (
    <Layout>
      <SEO title="Chart-2" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Chart 2</h1>
      <div id="c2" />
    </Layout>
  )
}

export default C2
