// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {cloneDeep, isEqual} from 'lodash';

const circleObj = {
  count: 0, //数量
  object_ids: [], // id列表
  centers: [], //中心点坐标（二维数组）
  z_values: [], //中心点z值
  radius: [], //半径
  styles: [], //style列表
  style_indexs: [], //style索引值
  classes: [], //class列表
  class_indexs: [], //class索引值
  subcategories: []
};

//polyline/polygon数据结构一致
const polylineObj = {
  count: 0, //数量
  object_ids: [], // id列表
  vertices: [], // 点坐标（二维数组）
  point_counts: [], //每个feature的点数量
  z_values: [], //点坐标z值
  styles: [], //style列表
  style_indexs: [], //style索引值
  classes: [], //class列表
  class_indexs: [], //class索引值
  subcategories: []
};

/**
 * 数据格式转换
 * @param message
 */
export const conversion_message = message => {
  message?.data?.updates?.forEach(item => {
    const primitives = item.primitives;

    for (let key in primitives) {
      const primitive = primitives[key];
      const circles = primitive.circles;
      if (circles && circles.length) {
        const circle_obj = cloneDeep(circleObj);
        circles.forEach(item => {
          const {center, high_precision_center, radius, base} = item;
          const {object_id = '', style = {}, classes = [], subcategories = []} = base;
          circle_obj.count++;
          circle_obj.object_ids.push(object_id);

          if (center) {
            circle_obj.centers.push(center[0]);
            circle_obj.centers.push(center[1]);
            circle_obj.z_values.push(center[2]);
          }

          if (high_precision_center) {
            if (!circle_obj.high_precision_center) circle_obj.high_precision_center = [];
            if (!circle_obj.high_precision_z_values) circle_obj.high_precision_z_values = [];
            circle_obj.high_precision_center.push(high_precision_center[0]);
            circle_obj.high_precision_center.push(high_precision_center[1]);
            circle_obj.high_precision_z_values.push(high_precision_center[2]);
          }

          circle_obj.radius.push(radius);
          const styleIndex = circle_obj.styles.findIndex(ele => isEqual(ele, style));
          if (styleIndex !== -1) {
            circle_obj.style_indexs.push(styleIndex);
          } else {
            circle_obj.styles.push(style);
            circle_obj.style_indexs.push(circle_obj.styles.length - 1);
          }

          const classes_str = JSON.stringify(classes);
          const classIndex = circle_obj.classes.findIndex(ele => isEqual(ele, classes_str));
          if (classIndex !== -1) {
            circle_obj.class_indexs.push(classIndex);
          } else {
            circle_obj.classes.push(classes_str);
            circle_obj.class_indexs.push(circle_obj.classes.length - 1);
          }

          const subcategories_str = JSON.stringify(subcategories);
          circle_obj.subcategories.push(subcategories_str);
        });
        //移除空数据
        const valid_id_index = circle_obj.object_ids.findIndex(item => item !== '');
        if (valid_id_index == -1) {
          circle_obj.object_ids = [];
        }

        const valid_subcategories_index = circle_obj.subcategories.findIndex(item => item !== '[]');
        if (valid_subcategories_index == -1) {
          circle_obj.subcategories = [];
        }

        const valid_style_index = circle_obj.styles.findIndex(item => !isEqual(item, {}));
        if (valid_style_index == -1) {
          circle_obj.styles = [];
          circle_obj.style_indexs = [];
        }

        const valid_classes_index = circle_obj.classes.findIndex(item => item !== '[]');
        if (valid_classes_index == -1) {
          circle_obj.classes = [];
          circle_obj.class_indexs = [];
        }

        //移除相同的z
        if (circle_obj.z_values) {
          const allEqual = circle_obj.z_values.every(
            v => Math.abs(v - circle_obj.z_values[0]) < 0.00001
          );
          if (allEqual) {
            circle_obj.z_values = [circle_obj.z_values[0]];
          }
        }

        if (circle_obj.high_precision_z_values) {
          const allEqual = circle_obj.high_precision_z_values.every(
            v => Math.abs(v - circle_obj.high_precision_z_values[0]) < 0.00001
          );
          if (allEqual) {
            circle_obj.high_precision_z_values = [circle_obj.high_precision_z_values[0]];
          }
        }

        primitive.circles = [];
        primitive.conversion_circles = circle_obj;
      }

      const polylines = primitive.polylines;
      if (polylines && polylines.length) {
        const polyline_obj = cloneDeep(polylineObj);
        polylines.forEach((item, index) => {
          const {vertices, high_precision_vertices, base} = item;
          const {object_id = '', style = {}, classes = [], subcategories = []} = base;
          polyline_obj.count++;
          polyline_obj.object_ids.push(object_id);
          let point_count = 0;

          if (vertices) {
            vertices?.forEach(point => {
              point_count++;
              polyline_obj.vertices.push(point[0]);
              polyline_obj.vertices.push(point[1]);
              polyline_obj.z_values.push(point[2]);
            });
          }

          if (high_precision_vertices) {
            if (!polyline_obj.high_precision_vertices) polyline_obj.high_precision_vertices = [];
            if (!polyline_obj.high_precision_z_values) polyline_obj.high_precision_z_values = [];
            high_precision_vertices.forEach(point => {
              polyline_obj.high_precision_vertices.push(point[0]);
              polyline_obj.high_precision_vertices.push(point[1]);
              polyline_obj.high_precision_z_values.push(point[2]);
            });
          }
          polyline_obj.point_counts.push(point_count);

          const styleIndex = polyline_obj.styles.findIndex(ele => isEqual(ele, style));
          if (styleIndex !== -1) {
            polyline_obj.style_indexs.push(styleIndex);
          } else {
            polyline_obj.styles.push(style);
            polyline_obj.style_indexs.push(polyline_obj.styles.length - 1);
          }

          const classes_str = JSON.stringify(classes);
          const classIndex = polyline_obj.classes.findIndex(ele => isEqual(ele, classes_str));
          if (classIndex !== -1) {
            polyline_obj.class_indexs.push(classIndex);
          } else {
            polyline_obj.classes.push(classes_str);
            polyline_obj.class_indexs.push(polyline_obj.classes.length - 1);
          }

          const subcategories_str = JSON.stringify(subcategories);
          polyline_obj.subcategories.push(subcategories_str);
        });
        //移除空数据
        const valid_id_index = polyline_obj.object_ids.findIndex(item => item !== '');
        if (valid_id_index == -1) {
          polyline_obj.object_ids = [];
        }

        const valid_subcategories_index = polyline_obj.subcategories.findIndex(
          item => item !== '[]'
        );
        if (valid_subcategories_index == -1) {
          polyline_obj.subcategories = [];
        }

        const valid_style_index = polyline_obj.styles.findIndex(item => !isEqual(item, {}));
        if (valid_style_index == -1) {
          polyline_obj.styles = [];
          polyline_obj.style_indexs = [];
        }

        const valid_classes_index = polyline_obj.classes.findIndex(item => item !== '[]');
        if (valid_classes_index == -1) {
          polyline_obj.classes = [];
          polyline_obj.class_indexs = [];
        }

        //移除相同的z
        if (polyline_obj.z_values) {
          const allEqual = polyline_obj.z_values.every(
            v => Math.abs(v - polyline_obj.z_values[0]) < 0.00001
          );
          if (allEqual) {
            polyline_obj.z_values = [polyline_obj.z_values[0]];
          }
        }

        if (polyline_obj.high_precision_z_values) {
          const allEqual = polyline_obj.high_precision_z_values.every(
            v => Math.abs(v - polyline_obj.high_precision_z_values[0]) < 0.00001
          );
          if (allEqual) {
            polyline_obj.high_precision_z_values = [polyline_obj.high_precision_z_values[0]];
          }
        }

        primitive.polylines = [];
        primitive.conversion_polylines = polyline_obj;
      }

      const polygons = primitive.polygons;
      if (polygons && polygons.length) {
        const polygon_obj = cloneDeep(polylineObj);
        polygons.forEach((item, index) => {
          const {vertices, high_precision_vertices, base} = item;
          const {object_id = '', style = {}, classes = [], subcategories = []} = base;
          polygon_obj.count++;
          polygon_obj.object_ids.push(object_id);
          let point_count = 0;
          if (vertices) {
            vertices.forEach(point => {
              point_count++;
              polygon_obj.vertices.push(point[0]);
              polygon_obj.vertices.push(point[1]);
              polygon_obj.z_values.push(point[2]);
            });
          }

          if (high_precision_vertices) {
            if (!polygon_obj.high_precision_vertices) polygon_obj.high_precision_vertices = [];
            if (!polygon_obj.high_precision_z_values) polygon_obj.high_precision_z_values = [];
            high_precision_vertices.forEach(point => {
              polygon_obj.high_precision_vertices.push(point[0]);
              polygon_obj.high_precision_vertices.push(point[1]);
              polygon_obj.high_precision_z_values.push(point[2]);
            });
          }

          polygon_obj.point_counts.push(point_count);

          const styleIndex = polygon_obj.styles.findIndex(ele => isEqual(ele, style));
          if (styleIndex !== -1) {
            polygon_obj.style_indexs.push(styleIndex);
          } else {
            polygon_obj.styles.push(style);
            polygon_obj.style_indexs.push(polygon_obj.styles.length - 1);
          }

          const classes_str = JSON.stringify(classes);
          const classIndex = polygon_obj.classes.findIndex(ele => isEqual(ele, classes_str));
          if (classIndex !== -1) {
            polygon_obj.class_indexs.push(classIndex);
          } else {
            polygon_obj.classes.push(classes_str);
            polygon_obj.class_indexs.push(polygon_obj.classes.length - 1);
          }

          const subcategories_str = JSON.stringify(subcategories);
          polygon_obj.subcategories.push(subcategories_str);
        });
        //移除空数据
        const valid_id_index = polygon_obj.object_ids.findIndex(item => item !== '');
        if (valid_id_index == -1) {
          polygon_obj.object_ids = [];
        }

        const valid_subcategories_index = polygon_obj.subcategories.findIndex(
          item => item !== '[]'
        );
        if (valid_subcategories_index == -1) {
          polygon_obj.subcategories = [];
        }

        const valid_style_index = polygon_obj.styles.findIndex(item => !isEqual(item, {}));
        if (valid_style_index == -1) {
          polygon_obj.styles = [];
          polygon_obj.style_indexs = [];
        }

        const valid_classes_index = polygon_obj.classes.findIndex(item => item !== '[]');
        if (valid_classes_index == -1) {
          polygon_obj.classes = [];
          polygon_obj.class_indexs = [];
        }

        //移除相同的z
        if (polygon_obj.z_values) {
          const allEqual = polygon_obj.z_values.every(
            v => Math.abs(v - polygon_obj.z_values[0]) < 0.00001
          );
          if (allEqual) {
            polygon_obj.z_values = [polygon_obj.z_values[0]];
          }
        }

        if (polygon_obj.high_precision_z_values) {
          const allEqual = polygon_obj.high_precision_z_values.every(
            v => Math.abs(v - polygon_obj.high_precision_z_values[0]) < 0.00001
          );
          if (allEqual) {
            polygon_obj.high_precision_z_values = [polygon_obj.high_precision_z_values[0]];
          }
        }

        primitive.polygons = [];
        primitive.conversion_polygons = polygon_obj;
      }
    }
  });

  return message;
};

export const d_conversion_message = message => {
  message?.data?.updates?.forEach(item => {
    const primitives = item.primitives;

    for (let key in primitives) {
      const primitive = primitives[key];
      //将转换后的格式再转回去
      const conversion_polylines = primitive.conversion_polylines;
      if (conversion_polylines) {
        primitive.polylines = [];
        const {
          count,
          object_ids,
          vertices,
          high_precision_vertices,
          point_counts,
          z_values,
          high_precision_z_values,
          styles,
          style_indexs,
          classes,
          class_indexs,
          subcategories
        } = conversion_polylines;
        for (let i = 0; i < count; ++i) {
          const polyline = {
            vertices: [],
            base: {}
          };
          if (vertices && vertices.length) {
            const point_count = point_counts[i];
            for (let k = 0; k < point_count; ++k) {
              const x = vertices.shift();
              const y = vertices.shift();
              const z = z_values.length > 1 ? z_values.shift() : z_values[0];
              polyline.vertices.push(x);
              polyline.vertices.push(y);
              polyline.vertices.push(z);
            }
          }
          if (high_precision_vertices && high_precision_vertices.length) {
            const point_count = point_counts[i];
            polyline.high_precision_vertices = [];
            for (let k = 0; k < point_count; ++k) {
              const x = high_precision_vertices.shift();
              const y = high_precision_vertices.shift();
              const z =
                high_precision_z_values.length > 1
                  ? high_precision_z_values.shift()
                  : high_precision_z_values[0];
              polyline.high_precision_vertices.push(x);
              polyline.high_precision_vertices.push(y);
              polyline.high_precision_vertices.push(z);
            }
          }
          if (object_ids && object_ids.length) {
            polyline.base.object_id = object_ids[i] || '0';
          }
          if (styles && styles.length && style_indexs && style_indexs.length) {
            polyline.base.style = styles[style_indexs[i]] || {};
          }
          if (classes && classes.length && class_indexs && class_indexs.length) {
            polyline.base.classes = JSON.parse(classes[class_indexs[i]]);
          }
          if (subcategories && subcategories.length) {
            polyline.base.subcategories = JSON.parse(subcategories[i]);
          }
          primitive.polylines.push(polyline);
        }
        delete primitive.conversion_polylines;
      }

      const conversion_polygons = primitive.conversion_polygons;
      if (conversion_polygons) {
        primitive.polygons = [];
        const {
          count,
          object_ids,
          vertices,
          high_precision_vertices,
          point_counts,
          z_values,
          high_precision_z_values,
          styles,
          style_indexs,
          classes,
          class_indexs,
          subcategories
        } = conversion_polygons;
        for (let i = 0; i < count; ++i) {
          const polygon = {
            vertices: [],
            base: {}
          };
          if (vertices && vertices.length) {
            const point_count = point_counts[i];
            for (let k = 0; k < point_count; ++k) {
              const x = vertices.shift();
              const y = vertices.shift();
              const z = z_values.length > 1 ? z_values.shift() : z_values[0];
              polygon.vertices.push(x);
              polygon.vertices.push(y);
              polygon.vertices.push(z);
            }
          }
          if (high_precision_vertices && high_precision_vertices.length) {
            const point_count = point_counts[i];
            polygon.high_precision_vertices = [];
            for (let k = 0; k < point_count; ++k) {
              const x = high_precision_vertices.shift();
              const y = high_precision_vertices.shift();
              const z =
                high_precision_z_values.length > 1
                  ? high_precision_z_values.shift()
                  : high_precision_z_values[0];
              polygon.high_precision_vertices.push(x);
              polygon.high_precision_vertices.push(y);
              polygon.high_precision_vertices.push(z);
            }
          }
          if (object_ids && object_ids.length) {
            polygon.base.object_id = object_ids[i] || '0';
          }
          if (styles && styles.length && style_indexs && style_indexs.length) {
            polygon.base.style = styles[style_indexs[i]] || {};
          }
          if (classes && classes.length && class_indexs && class_indexs.length) {
            polygon.base.classes = JSON.parse(classes[class_indexs[i]]);
          }
          if (subcategories && subcategories.length) {
            polygon.base.subcategories = JSON.parse(subcategories[i]);
          }

          primitive.polygons.push(polygon);
        }
        delete primitive.conversion_polygons;
      }

      const conversion_circles = primitive.conversion_circles;
      if (conversion_circles) {
        primitive.circles = [];
        const {
          count,
          object_ids,
          centers,
          high_precision_centers,
          z_values,
          high_precision_z_values,
          radius,
          styles,
          style_indexs,
          classes,
          class_indexs,
          subcategories
        } = conversion_circles;
        for (let i = 0; i < count; ++i) {
          const circle = {
            radius: 0,
            base: {}
          };
          if (centers && centers.length) {
            const x = centers.shift();
            const y = centers.shift();
            const z = z_values.length > 1 ? z_values.shift() : z_values[0];
            circle.center = [x, y, z];
          }
          if (high_precision_centers && high_precision_centers.length) {
            const x = high_precision_centers.shift();
            const y = high_precision_centers.shift();
            const z =
              high_precision_z_values.length > 1
                ? high_precision_z_values.shift()
                : high_precision_z_values[0];
            circle.high_precision_center = [x, y, z];
          }
          circle.radius = radius[i];
          if (object_ids && object_ids.length) {
            circle.base.object_id = object_ids[i] || '0';
          }
          if (styles && styles.length && style_indexs && style_indexs.length) {
            circle.base.style = styles[style_indexs[i]] || {};
          }
          if (classes && classes.length && class_indexs && class_indexs.length) {
            circle.base.classes = JSON.parse(classes[class_indexs[i]]);
          }
          if (subcategories && subcategories.length) {
            circle.base.subcategories = JSON.parse(subcategories[i]);
          }
          primitive.circles.push(circle);
        }
        delete primitive.conversion_circles;
      }
    }
  });

  return message;
};
