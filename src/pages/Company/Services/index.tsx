import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchCategories, createCategoryRequest } from "../../../redux/actions";
import { selectCategories, selectCategoriesLoading } from "../../../redux/selectors";
import { Category as CategoryType, DisplayStatus, SortDirection } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Button, Collapse, Popconfirm, Row, message } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css'
import Category from './category'

const { Panel } = Collapse;


interface ICalendarState {
    editingTitle: number | null;
    activeKey: string[]
}

interface ICalendarProps {
    loading: boolean;
    fetchCategories: () => Promise<any>;
    createCategoryRequest: (category: CategoryType) => Promise<any>;
    categories: CategoryType[];
}

class ServicesPage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            editingTitle: null,
            activeKey: ["0"]
        };
    }

    componentDidMount() {
        this.props.fetchCategories();
    }

    getHeader = (category: CategoryType, index: number) => (
        <span className="font-bold text-lg">{category.name}</span>
    );

    onChangeActiveKey = (key: string | string[]) => {
        if (typeof key === 'string') {
            this.setState({ activeKey: [key] })
        } else {
            this.setState({ activeKey: key })
        }

    }

    onCreateCategory = () => {
        const newCategory: CategoryType = {
            name: "New Category",
            category: "Performance group",
            choices: "Simple selection (only one entry can be selected)",
            selection_is_optional: false,
            show_price: false,
            show_appointment_duration: false,
            no_columns_of_services: 3,
            full_screen: false,
            folded: false,
            online_booking: false,
            remarks: "",
            unique_id: Math.floor(1000 + Math.random() * 9000),
            display_status: DisplayStatus.SHOW,
            advanced_settings: {
                sorting_order: SortDirection.NONE,
            },
            services: []
        };
        this.props.createCategoryRequest(newCategory).then(data => {
            if (data._id) {
                message.success('Successfully created the category');
                this.setState({ activeKey: [`${this.props.categories.length - 1}`] })
            } else {
                message.error('Something went wrong. please try again');
            }
        })
    }


    render() {
        const { loading, categories } = this.props;
        const { activeKey } = this.state;

        if (loading) {
            return <div>loading...</div>;
        }

        return (
            <div className="w-full">
                <Popconfirm
                    title="create new category?"
                    description="Are you sure you want to create new category?"
                    okText="Create It"
                    cancelText="No"
                    onConfirm={this.onCreateCategory}
                >
                    <Button loading={false} className="mb-3" type="primary">New Category</Button>
                </Popconfirm>
                <Collapse accordion activeKey={`${activeKey}`} onChange={this.onChangeActiveKey} defaultActiveKey={["0"]}>
                    {categories.map((el, index) => (
                        <Panel header={this.getHeader(el, index)} key={`${index}`}>
                            <Category category={el} index={index} />
                        </Panel>
                    ))}
                </Collapse>
            </div>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    categories: selectCategories(state),
    loading: selectCategoriesLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCategories: () => dispatch(fetchCategories()),
    createCategoryRequest: (category: CategoryType) => dispatch(createCategoryRequest(category)),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(ServicesPage))

export default connect(mapStateToProps, mapDispatchToProps)(ServicesPage)
