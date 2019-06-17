/* tslint:disable */
import '../styles/c6.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
import * as topojson from '../../dataset/topojson.min'
// @ts-ignore
import customData from '../../dataset/custom.topo.json'

const Chart7 = () => {
  let svg, geojson, path, projection

  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const setMapBase = () => {
      const margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom
      geojson = topojson.feature(customData, customData.objects['custom.geo'])
      svg = d3
        .select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
      projection = d3.geoAlbers()
      path = d3.geoPath().projection(projection)
      projection.rotate(-75).fitExtent([[0, 0], [width, height]], geojson)
    }

    const drawCountries = () => {
      const countryGroup = svg
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', 'lightgray')
        .attr('stroke', 'white')
      return countryGroup
    }

    const drawCapitals = capitals => {
      const circleRadius = 5
      const textSize = 10
      const capitalGroup = svg.append('g')
      capitalGroup
        .selectAll('circle')
        .data(capitals)
        .enter()
        .append('circle')
        .attr('cx', city => projection([city.lng, city.lat])[0])
        .attr('cy', city => projection([city.lng, city.lat])[1])
        .attr('r', circleRadius + 'px')
        .attr('fill', 'red')

      capitalGroup
        .selectAll('text')
        .data(capitals)
        .enter()
        .append('text')
        .attr('x', city => projection([city.lng, city.lat])[0])
        .attr('y', city => projection([city.lng, city.lat])[1])
        .attr('font-size', textSize + 'px')
        .attr('transform', `translate(${circleRadius}, ${textSize / 2})`)
        .text(city => city.city)
      return capitalGroup
    }

    d3.csv('capitals.csv').then(capitalsData => {
      setMapBase()
      drawCountries()
      drawCapitals(capitalsData)
    })
  }
  return (
    <Layout>
      <SEO title="Chart 7" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Europe with capitals</h1>
      <div id="c7" />
    </Layout>
  )
}

export default Chart7
