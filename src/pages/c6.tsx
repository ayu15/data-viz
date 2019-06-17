/* tslint:disable */
import '../styles/c6.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
import * as topojson from '../../dataset/topojson.min'
// @ts-ignore
import customData from '../../dataset/custom.topo.json'

const Chart6 = () => {
  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 },
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom

    const geojson = topojson.feature(customData, customData.objects['custom.geo'])

    const svg = d3
      .select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const projection = d3.geoAlbers()
    const path = d3.geoPath().projection(projection)
    projection.rotate(-75).fitExtent([[0, 0], [width, height]], geojson)

    svg
      .selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', 'lightgray')
      .attr('stroke', 'white')
  }
  return (
    <Layout>
      <SEO title="Chart 6" keywords={[`gatsby`, `application`, `react`]} />
      <h1>topojson</h1>
      <div id="c6" />
    </Layout>
  )
}

export default Chart6
