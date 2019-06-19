/* tslint:disable */
import '../styles/c9.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
// @ts-ignore
import customData from '../../dataset/india-lo.geo.json'

const Chart11 = () => {
  let svg, geoGenerator, projection
  let geojson = customData
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  }
  const width = 960 - margin.left - margin.right
  const height = 600 - margin.top - margin.bottom

  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const setMapBase = () => {
      projection = d3.geoEquirectangular().fitExtent([[0, 0], [width, height]], geojson)
      geoGenerator = d3.geoPath().projection(projection)

      svg = d3
        .select('#map-container')
        .append('svg')
        .attr('id', 'map')
        .attr('viewBox', '0 0 960 600')
        .style('width', '100%')
        .style('height', 'auto')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .append('g')
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', geoGenerator)
        .attr('fill', 'lightblue')
        .attr('stroke', 'black')
    }

    setMapBase()
  }
  return (
    <Layout>
      <SEO title="Chart 11" keywords={[`gatsby`, `application`, `react`]} />
      <h1>India map</h1>
      <div id="map-container" />
    </Layout>
  )
}

export default Chart11
